const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// ── Utility: Parse JSON safely ──
function cleanJsonResponse(text) {
  try {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    return JSON.parse(cleaned.trim());
  } catch (err) {
    console.error('JSON parse failed. Raw:', text?.substring(0, 200));
    throw new Error('Invalid JSON response from Gemini');
  }
}

// ── Utility: Exponential Backoff Retry ──
async function fetchWithRetry(body, maxRetries = 3) {
  let delay = 1500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Retry on 503 (overloaded) or 429 (rate limited)
      if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
        console.warn(`Gemini ${response.status}. Retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        const reason = data?.candidates?.[0]?.finishReason;
        throw new Error(`Empty Gemini response (${reason || 'unknown'})`);
      }

      return cleanJsonResponse(text);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      if (err.message?.includes('Failed to fetch')) {
        console.warn(`Network error. Retry ${attempt + 1}/${maxRetries}`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

// ── Crop Image Analysis ──
export async function analyzeCropImage(base64Image, mimeType = 'image/jpeg') {
  const prompt = `Analyze this crop image. Return ONLY valid JSON:
{"crop_name":"","crop_age_estimate":"seedling|juvenile|mature|harvesting","disease_detected":"name or Healthy","disease_severity":"mild|moderate|severe|none","disease_description":"brief description","treatment_plan":["step1","step2"],"recommended_pesticides":[{"name":"","type":"fungicide|insecticide|herbicide","dosage":"ml/L","application_method":"","frequency":"","precautions":"","is_toxic":false}],"organic_alternatives":[""],"fertilizer_suggestions":"","general_crop_tips":[""],"urgency_level":"act now|monitor|routine"}
Be concise. Max 2 pesticides, 2 tips.`;

  return fetchWithRetry({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    }
  });
}

// ── Irrigation Plan ──
export async function generateIrrigationPlan(cropName, weatherData) {
  const trimmed = weatherData.daily?.slice(0, 7).map(d => ({
    date: d.date, max: d.temperature_max, min: d.temperature_min,
    rain: d.precipitation, humidity: d.humidity_mean,
  }));

  const prompt = `7-day irrigation plan for "${cropName}". Weather: ${JSON.stringify(trimmed)}
Return ONLY valid JSON:
{"daily_plan":[{"day":"","irrigation_needed":true,"water_amount":"","best_time":"morning|evening|not needed","warnings":[],"pesticide_spray_ok":true,"spray_note":"","heat_stress_alert":false,"heat_stress_note":""}],"recommended_pesticides":[{"name":"","purpose":"","dosage":""}],"general_irrigation_tips":[""],"weekly_summary":""}
Be concise. Max 2 pesticides, 2 tips.`;

  return fetchWithRetry({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    }
  });
}

// ── Crop Profile ──
export async function generateCropProfile(cropName) {
  const prompt = `Crop profile for "${cropName}". Return ONLY valid JSON:
{"crop_name":"","scientific_name":"","description":"","growing_season":"","ideal_temperature":"","soil_type":"","water_needs":"","sunlight":"","spacing":"","germination_time":"","harvest_time":"","common_diseases":[{"name":"","symptoms":"","prevention":""}],"common_pests":[""],"companion_plants":[""],"nutritional_needs":"","care_tips":[""],"yield_estimate":""}
Be concise. Max 3 diseases, 3 pests, 3 tips.`;

  return fetchWithRetry({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    }
  });
}
