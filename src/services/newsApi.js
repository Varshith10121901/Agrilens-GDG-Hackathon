const GNEWS_API_KEY = process.env.REACT_APP_GNEWS_API_KEY;

// ── Fetch a relevant image from Pexels/Unsplash-style free image search ──
async function fetchImageForArticle(query) {
  try {
    // Use Pixabay's free API (no auth needed for basic usage) as a fallback image source
    const searchQuery = encodeURIComponent(query.slice(0, 80));
    const pixabayUrl = `https://pixabay.com/api/?key=47026245-4f6e3117c1f1e47c51e3b3291&q=${searchQuery}&image_type=photo&per_page=3&safesearch=true&category=nature`;
    
    const res = await fetch(pixabayUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.hits?.length > 0) {
        return data.hits[0].webformatURL;
      }
    }
  } catch {
    // Silent fail — we'll use a fallback
  }
  return null;
}

export async function getAgricultureNews() {
  const keywords = 'agriculture OR farming OR crop';
  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=6&apikey=${GNEWS_API_KEY}`;

  // Try direct first (works on localhost), then CORS proxy (for deployed sites)
  const urls = [
    gnewsUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(gnewsUrl)}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const data = await response.json();
      if (data.articles?.length > 0) {
        // Enrich articles that are missing images
        const enrichedArticles = await Promise.all(
          data.articles.map(async (article) => {
            if (!article.image) {
              // Try to fetch an image based on the article title
              const fetchedImage = await fetchImageForArticle(
                article.title || 'agriculture farming crops'
              );
              return { ...article, image: fetchedImage };
            }
            return article;
          })
        );
        return enrichedArticles;
      }
    } catch {
      continue;
    }
  }

  // All attempts failed — return curated fallback
  console.warn('News API unavailable, using fallback stories');
  return getFallbackNews();
}

function getFallbackNews() {
  return [
    {
      title: 'New Bio-Pesticide Approved for Organic Farming',
      description: 'A groundbreaking bio-pesticide derived from neem extract has been approved for use in organic farming, offering effective pest control without harmful chemicals.',
      url: '#',
      image: 'https://images.unsplash.com/photo-1592982537447-6f2ae8c1c5bb?w=800&q=70',
      publishedAt: new Date().toISOString(),
      source: { name: 'AgriNews', url: '#' }
    },
    {
      title: 'Government Launches New Crop Insurance Scheme',
      description: 'A comprehensive crop insurance scheme has been launched to protect farmers against natural calamities, pests, and diseases affecting their harvest.',
      url: '#',
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=70',
      publishedAt: new Date().toISOString(),
      source: { name: 'FarmPolicy', url: '#' }
    },
    {
      title: 'Drip Irrigation Saves 40% Water in Summer Crops',
      description: 'Studies show that drip irrigation systems can save up to 40% water compared to flood irrigation, while increasing crop yields by 20-30%.',
      url: '#',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=70',
      publishedAt: new Date().toISOString(),
      source: { name: 'WaterWise', url: '#' }
    },
    {
      title: 'AI-Powered Crop Monitoring Gains Traction',
      description: 'Artificial intelligence is revolutionizing agriculture with smart crop monitoring systems that can detect diseases early and optimize irrigation schedules.',
      url: '#',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad849?w=800&q=70',
      publishedAt: new Date().toISOString(),
      source: { name: 'TechFarm', url: '#' }
    },
    {
      title: 'Rising Demand for Organic Vegetables in Urban Markets',
      description: 'Urban consumers are increasingly seeking organic vegetables, creating new market opportunities for farmers who adopt organic farming practices.',
      url: '#',
      image: 'https://images.unsplash.com/photo-1563968743333-044cef8528f8?w=800&q=70',
      publishedAt: new Date().toISOString(),
      source: { name: 'MarketWatch', url: '#' }
    },
    {
      title: 'Smart Greenhouse Technology Doubles Yield in Winter',
      description: 'Farmers using IoT-enabled greenhouses report up to 2x yield improvements during winter months through automated climate control and LED lighting.',
      url: '#',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=70',
      publishedAt: new Date().toISOString(),
      source: { name: 'AgriTech', url: '#' }
    },
  ];
}
