import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Location tracking service
export const locationService = {
  // Get current location using browser geolocation
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Watch location changes
  watchLocation: (callback, options = {}) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed || null,
          heading: position.coords.heading || null
        });
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      { ...defaultOptions, ...options }
    );
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Calculate bearing between two points
  calculateBearing: (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  },

  // Geocoding - convert address to coordinates
  geocode: async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: data.results[0].formatted_address
        };
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
  },

  // Reverse geocoding - convert coordinates to address
  reverseGeocode: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return {
          address: data.results[0].formatted_address,
          components: data.results[0].address_components
        };
      } else {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }
    } catch (error) {
      throw new Error(`Reverse geocoding error: ${error.message}`);
    }
  },

  // Get route between two points
  getRoute: async (origin, destination, mode = 'driving') => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: leg.distance,
          duration: leg.duration,
          polyline: route.overview_polyline.points,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance,
            duration: step.duration,
            polyline: step.polyline.points
          }))
        };
      } else {
        throw new Error(`Route calculation failed: ${data.status}`);
      }
    } catch (error) {
      throw new Error(`Route calculation error: ${error.message}`);
    }
  },

  // Get nearby places
  getNearbyPlaces: async (lat, lng, radius = 1000, type = 'all') => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          location: place.geometry.location,
          rating: place.rating,
          types: place.types,
          vicinity: place.vicinity
        }));
      } else {
        throw new Error(`Nearby places search failed: ${data.status}`);
      }
    } catch (error) {
      throw new Error(`Nearby places search error: ${error.message}`);
    }
  }
};

// API-based location services
export const getAllLocations = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch locations');
  }
};

export const getLocationHistory = async (entityId, entityType, token) => {
  try {
    const response = await axios.get(`${API_URL}/locations/history/${entityType}/${entityId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch location history');
  }
};

export const updateLocation = async (entityId, entityType, location, token) => {
  try {
    const response = await axios.post(`${API_URL}/locations/update`, {
      entityId,
      entityType,
      location
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update location');
  }
};

export const getLocationAnalytics = async (entityId, entityType, dateRange, token) => {
  try {
    const response = await axios.get(`${API_URL}/locations/analytics/${entityType}/${entityId}`, {
      params: dateRange,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch location analytics');
  }
};

export const exportLocationData = async (entityIds, entityType, dateRange, token) => {
  try {
    const response = await axios.post(`${API_URL}/locations/export`, {
      entityIds,
      entityType,
      dateRange
    }, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export location data');
  }
};

// Location tracking utilities
export const locationUtils = {
  // Format distance for display
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },

  // Format duration for display
  formatDuration: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  // Check if location is within bounds
  isLocationInBounds: (location, bounds) => {
    return location.lat >= bounds.south && 
           location.lat <= bounds.north && 
           location.lng >= bounds.west && 
           location.lng <= bounds.east;
  },

  // Calculate center point of multiple locations
  calculateCenter: (locations) => {
    if (locations.length === 0) return null;
    
    const sum = locations.reduce((acc, loc) => ({
      lat: acc.lat + loc.lat,
      lng: acc.lng + loc.lng
    }), { lat: 0, lng: 0 });
    
    return {
      lat: sum.lat / locations.length,
      lng: sum.lng / locations.length
    };
  },

  // Calculate bounds for multiple locations
  calculateBounds: (locations) => {
    if (locations.length === 0) return null;
    
    const lats = locations.map(loc => loc.lat);
    const lngs = locations.map(loc => loc.lng);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  },

  // Validate location coordinates
  isValidLocation: (location) => {
    return location && 
           typeof location.lat === 'number' && 
           typeof location.lng === 'number' &&
           location.lat >= -90 && location.lat <= 90 &&
           location.lng >= -180 && location.lng <= 180;
  },

  // Get location accuracy level
  getAccuracyLevel: (accuracy) => {
    if (accuracy < 10) return 'excellent';
    if (accuracy < 50) return 'good';
    if (accuracy < 100) return 'fair';
    return 'poor';
  }
};

export default locationService; 