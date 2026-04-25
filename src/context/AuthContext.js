import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'agrilens_farmer_profile';

function loadProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }) {
  const [farmer, setFarmer] = useState(() => loadProfile());

  useEffect(() => {
    if (farmer) {
      saveProfile(farmer);
    }
  }, [farmer]);

  const login = (profileData) => {
    const newProfile = {
      name: profileData.name,
      phone: profileData.phone || '',
      location: profileData.location || '',
      currentCrop: null,
      scanHistory: [],
      createdAt: new Date().toISOString(),
      ...profileData,
    };
    setFarmer(newProfile);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFarmer(null);
  };

  const updateProfile = (updates) => {
    setFarmer(prev => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  const saveScanResult = (scanData, imageUrl) => {
    setFarmer(prev => {
      const entry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageUrl,
        ...scanData,
      };
      const history = [entry, ...(prev.scanHistory || [])].slice(0, 20);
      return {
        ...prev,
        scanHistory: history,
        currentCrop: {
          name: scanData.crop_name,
          lastScan: entry,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const setCurrentCrop = (cropName) => {
    setFarmer(prev => ({
      ...prev,
      currentCrop: {
        ...(prev.currentCrop || {}),
        name: cropName,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const value = {
    farmer,
    isAuthenticated: !!farmer,
    login,
    logout,
    updateProfile,
    saveScanResult,
    setCurrentCrop,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
