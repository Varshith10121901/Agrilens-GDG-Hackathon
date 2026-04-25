const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function getWeatherForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'windspeed_10m_max',
      'uv_index_max',
      'relative_humidity_2m_mean',
      'et0_fao_evapotranspiration',
      'sunshine_duration',
      'weathercode',
    ].join(','),
    hourly: [
      'soil_moisture_0_to_7cm',
      'soil_temperature_0cm',
    ].join(','),
    current: 'temperature_2m,relative_humidity_2m,weathercode',
    forecast_days: '7',
    timezone: 'auto'
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    const data = await response.json();

    // Compute daily averages for hourly soil data
    if (data.hourly) {
      data.daily_soil = computeDailySoilAverages(data);
    }

    return data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
}

// Aggregate hourly soil data into daily averages
function computeDailySoilAverages(data) {
  const hourlyTime = data.hourly?.time || [];
  const soilMoisture = data.hourly?.soil_moisture_0_to_7cm || [];
  const soilTemp = data.hourly?.soil_temperature_0cm || [];

  const dailyMap = {};

  hourlyTime.forEach((time, i) => {
    const day = time.split('T')[0];
    if (!dailyMap[day]) {
      dailyMap[day] = { moisture: [], temp: [] };
    }
    if (soilMoisture[i] != null) dailyMap[day].moisture.push(soilMoisture[i]);
    if (soilTemp[i] != null) dailyMap[day].temp.push(soilTemp[i]);
  });

  const dates = Object.keys(dailyMap).sort();
  return {
    dates,
    soil_moisture_avg: dates.map(d => {
      const vals = dailyMap[d].moisture;
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }),
    soil_temp_avg: dates.map(d => {
      const vals = dailyMap[d].temp;
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }),
  };
}

// Reverse geocoding via Nominatim (free, no API key)
export async function reverseGeocode(latitude, longitude) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=12`,
      { headers: { 'User-Agent': 'AgriLens/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const name =
      addr.city || addr.town || addr.village || addr.county ||
      addr.state_district || addr.state || 'Unknown Location';
    return {
      name,
      state: addr.state || '',
      country: addr.country || '',
      full: `${name}${addr.state ? ', ' + addr.state : ''}`,
    };
  } catch {
    return null;
  }
}

// Generate weather risk alerts for agriculture
export function generateWeatherAlerts(days) {
  const alerts = [];

  days.forEach((day, i) => {
    const label = i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

    if (day.temp_min != null && day.temp_min < 4) {
      alerts.push({ type: 'frost', severity: 'high', day: label, message: `Frost risk — ${Math.round(day.temp_min)}°C min` });
    }
    if (day.temp_max != null && day.temp_max > 38) {
      alerts.push({ type: 'heat', severity: 'high', day: label, message: `Heat stress — ${Math.round(day.temp_max)}°C max` });
    }
    if (day.precipitation != null && day.precipitation > 20) {
      alerts.push({ type: 'rain', severity: 'medium', day: label, message: `Heavy rain — ${day.precipitation.toFixed(1)}mm` });
    }
    if (day.uv_index != null && day.uv_index > 9) {
      alerts.push({ type: 'uv', severity: 'medium', day: label, message: `Extreme UV — index ${day.uv_index.toFixed(0)}` });
    }
  });

  // Drought check — no rain for 5+ consecutive days
  const dryDays = days.filter(d => (d.precipitation || 0) < 0.5).length;
  if (dryDays >= 5) {
    alerts.push({ type: 'drought', severity: 'high', day: '~', message: `Drought risk — ${dryDays} dry days this week` });
  }

  return alerts;
}

export function getWeatherDescription(code) {
  const descriptions = {
    0: { text: 'Clear sky', icon: 'sun' },
    1: { text: 'Mainly clear', icon: 'sun-cloud' },
    2: { text: 'Partly cloudy', icon: 'cloud-sun' },
    3: { text: 'Overcast', icon: 'cloud' },
    45: { text: 'Foggy', icon: 'fog' },
    48: { text: 'Depositing rime fog', icon: 'fog' },
    51: { text: 'Light drizzle', icon: 'rain-light' },
    53: { text: 'Moderate drizzle', icon: 'rain-light' },
    55: { text: 'Dense drizzle', icon: 'rain' },
    61: { text: 'Slight rain', icon: 'rain' },
    63: { text: 'Moderate rain', icon: 'rain' },
    65: { text: 'Heavy rain', icon: 'rain-heavy' },
    71: { text: 'Slight snow', icon: 'snow' },
    73: { text: 'Moderate snow', icon: 'snow' },
    75: { text: 'Heavy snow', icon: 'snow' },
    80: { text: 'Slight rain showers', icon: 'rain-light' },
    81: { text: 'Moderate rain showers', icon: 'rain' },
    82: { text: 'Violent rain showers', icon: 'storm' },
    95: { text: 'Thunderstorm', icon: 'storm' },
    96: { text: 'Thunderstorm with hail', icon: 'storm' },
    99: { text: 'Thunderstorm with heavy hail', icon: 'storm' },
  };
  return descriptions[code] || { text: 'Unknown', icon: 'thermometer' };
}

export function getCurrentSeason(latitude) {
  const month = new Date().getMonth() + 1;
  const isSouthern = latitude < 0;
  
  if (isSouthern) {
    if (month >= 3 && month <= 5) return 'Autumn';
    if (month >= 6 && month <= 8) return 'Winter';
    if (month >= 9 && month <= 11) return 'Spring';
    return 'Summer';
  } else {
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  }
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
