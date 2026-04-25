import { useState } from 'react';
import { generateCropProfile } from '../services/geminiApi';

const commonCrops = [
  { name: 'Rice', category: 'Cereal' },
  { name: 'Wheat', category: 'Cereal' },
  { name: 'Corn (Maize)', category: 'Cereal' },
  { name: 'Tomato', category: 'Vegetable' },
  { name: 'Potato', category: 'Vegetable' },
  { name: 'Onion', category: 'Vegetable' },
  { name: 'Cotton', category: 'Cash Crop' },
  { name: 'Sugarcane', category: 'Cash Crop' },
  { name: 'Soybean', category: 'Legume' },
  { name: 'Chickpea', category: 'Legume' },
  { name: 'Mango', category: 'Fruit' },
  { name: 'Banana', category: 'Fruit' },
  { name: 'Apple', category: 'Fruit' },
  { name: 'Grape', category: 'Fruit' },
  { name: 'Chili Pepper', category: 'Spice' },
  { name: 'Turmeric', category: 'Spice' },
  { name: 'Tea', category: 'Beverage' },
  { name: 'Coffee', category: 'Beverage' },
  { name: 'Sunflower', category: 'Oilseed' },
  { name: 'Groundnut', category: 'Oilseed' },
  { name: 'Cabbage', category: 'Vegetable' },
  { name: 'Carrot', category: 'Vegetable' },
  { name: 'Cucumber', category: 'Vegetable' },
  { name: 'Okra (Lady Finger)', category: 'Vegetable' },
];

function CropProfileDisplay({ profile }) {
  if (!profile) return null;

  return (
    <div className="page-transition space-y-4">
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--stone-900)', marginBottom: '0.125rem' }}>{profile.crop_name}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--stone-500)', fontStyle: 'italic', marginBottom: '0.75rem' }}>{profile.scientific_name}</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--stone-700)', lineHeight: '1.6' }}>{profile.description}</p>
      </div>

      {/* Quick Stats */}
      <div className="profile-stats-grid">
        {[
          { label: 'Season', value: profile.growing_season },
          { label: 'Temperature', value: profile.ideal_temperature },
          { label: 'Soil', value: profile.soil_type },
          { label: 'Water Needs', value: profile.water_needs },
          { label: 'Sunlight', value: profile.sunlight },
          { label: 'Spacing', value: profile.spacing },
          { label: 'Germination', value: profile.germination_time },
          { label: 'Harvest', value: profile.harvest_time },
        ].map((stat) => (
          <div key={stat.label} className="glass-card glass-card-hover profile-stat-card">
            <p className="profile-stat-label">{stat.label}</p>
            <p className="profile-stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Yield */}
      {profile.yield_estimate && (
        <div className="glass-card gradient-subtle" style={{ padding: '1.25rem', border: '1px solid var(--forest-200)' }}>
          <h3 style={{ fontWeight: '600', color: 'var(--stone-800)', marginBottom: '0.25rem' }}>Expected Yield</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--stone-700)' }}>{profile.yield_estimate}</p>
        </div>
      )}

      {/* Diseases */}
      {profile.common_diseases?.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 className="section-title mb-4">Common Diseases</h3>
          <div>
            {profile.common_diseases.map((disease, i) => (
              <div key={i} className="disease-card">
                <h4>{disease.name}</h4>
                <p><span style={{ fontWeight: '500' }}>Symptoms:</span> {disease.symptoms}</p>
                <p className="prevention"><span style={{ fontWeight: '500' }}>Prevention:</span> {disease.prevention}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pests & Companions */}
      <div className="pests-companions-grid">
        {profile.common_pests?.length > 0 && (
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: '600', color: 'var(--stone-800)', marginBottom: '0.75rem' }}>Common Pests</h3>
            <div className="tag-grid">
              {profile.common_pests.map((pest, i) => (
                <span key={i} className="badge badge-yellow">{pest}</span>
              ))}
            </div>
          </div>
        )}
        {profile.companion_plants?.length > 0 && (
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: '600', color: 'var(--stone-800)', marginBottom: '0.75rem' }}>Companion Plants</h3>
            <div className="tag-grid">
              {profile.companion_plants.map((plant, i) => (
                <span key={i} className="badge badge-green">{plant}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nutrition */}
      {profile.nutritional_needs && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: '600', color: 'var(--stone-800)', marginBottom: '0.5rem' }}>Nutritional Needs</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--stone-700)', lineHeight: '1.6' }}>{profile.nutritional_needs}</p>
        </div>
      )}

      {/* Care Tips */}
      {profile.care_tips?.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: '600', color: 'var(--stone-800)', marginBottom: '0.75rem' }}>Care Tips</h3>
          <div>
            {profile.care_tips.map((tip, i) => (
              <div key={i} className="list-item">
                <span className="list-item-icon">›</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EncyclopediaPage() {
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredCrops = commonCrops.filter(
    crop => crop.name.toLowerCase().includes(search.toLowerCase()) ||
            crop.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filteredCrops.map(c => c.category))];

  const handleCropSelect = async (crop) => {
    setSelectedCrop(crop);
    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const result = await generateCropProfile(crop.name);
      setProfile(result);
    } catch (err) {
      setError('Failed to generate crop profile. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCrop(null);
    setProfile(null);
    setError(null);
  };

  return (
    <div className="page-transition page-bottom-padding">
      <div className="mb-6">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--stone-900)' }}>Crop Encyclopedia</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--stone-500)', marginTop: '0.25rem' }}>
          Search crops and get AI-generated growing guides
        </p>
      </div>

      {selectedCrop && (
        <button onClick={handleBack} className="back-btn">
          <svg viewBox="0 0 16 16" fill="none" style={{ width: '1rem', height: '1rem' }} stroke="currentColor" strokeWidth="2">
            <path d="M10 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to crops
        </button>
      )}

      {!selectedCrop && (
        <>
          {/* Search Bar */}
          <div className="search-bar-wrapper">
            <svg viewBox="0 0 16 16" fill="none" className="search-bar-icon" style={{ width: '1rem', height: '1rem', color: 'var(--stone-400)' }} stroke="currentColor" strokeWidth="2">
              <circle cx="7" cy="7" r="5"/>
              <path d="M11 11l3 3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              id="crop-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crops by name or category..."
              className="input-field search-bar-input"
            />
          </div>

          {/* Crop Grid by Category */}
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h2 className="category-title">{category}</h2>
              <div className="crop-grid">
                {filteredCrops
                  .filter(c => c.category === category)
                  .map((crop) => (
                    <button
                      key={crop.name}
                      onClick={() => handleCropSelect(crop)}
                      className="glass-card glass-card-hover crop-grid-item"
                    >
                      <div className="crop-grid-icon">
                        <span>{crop.name.charAt(0)}</span>
                      </div>
                      <span className="crop-grid-name">{crop.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}

          {filteredCrops.length === 0 && (
            <div className="text-center" style={{ padding: '3rem 0' }}>
              <p style={{ color: 'var(--stone-500)', fontSize: '0.875rem' }}>No crops found matching "{search}"</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--stone-400)', marginTop: '0.25rem' }}>Try a different search term</p>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--stone-600)', fontWeight: '500', fontSize: '0.875rem' }}>
            Generating profile for {selectedCrop?.name}...
          </p>
        </div>
      )}

      {error && (
        <div className="glass-card error-card">
          <p style={{ fontSize: '0.875rem', color: 'var(--danger-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-dot status-dot-red" /> {error}
          </p>
          <button onClick={() => handleCropSelect(selectedCrop)} className="error-retry-btn">
            Try again
          </button>
        </div>
      )}

      {profile && <CropProfileDisplay profile={profile} />}
    </div>
  );
}
