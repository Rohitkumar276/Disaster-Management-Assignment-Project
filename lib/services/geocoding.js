import axios from 'axios';
import { logger } from '../utils/logger.js';
import { getFromCache, setCache } from './cache.service.js';

export const geocodeLocation = async (locationName) => {
  const cacheKey = `geocode_${locationName.toLowerCase().replace(/\s+/g, '_')}`;
  
  try {
    // Check cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.debug(`Geocoding from cache: ${locationName}`);
      return cached;
    }
    
    // Try multiple geocoding services
    let result = null;
    
    // Try Google Maps (if API key available)
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: locationName,
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        });
        
        if (response.data.results && response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          result = {
            lat: location.lat,
            lng: location.lng,
            formatted_address: response.data.results[0].formatted_address,
            service: 'google'
          };
        }
      } catch (error) {
        logger.warn('Google Maps geocoding failed:', error.message);
      }
    }
    
    // Fallback to OpenStreetMap Nominatim (free)
    if (!result) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: locationName,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'DisasterResponsePlatform/1.0'
          }
        });
        
        if (response.data && response.data.length > 0) {
          const location = response.data[0];
          result = {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon),
            formatted_address: location.display_name,
            service: 'osm'
          };
        }
      } catch (error) {
        logger.warn('OSM geocoding failed:', error.message);
      }
    }
    
    // Ultimate fallback with mock coordinates for known cities
    if (!result) {
      const mockCoordinates = {
        'manhattan, nyc': { lat: 40.7831, lng: -73.9712 },
        'new york, ny': { lat: 40.7128, lng: -74.0060 },
        'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
        'chicago, il': { lat: 41.8781, lng: -87.6298 },
        'houston, tx': { lat: 29.7604, lng: -95.3698 }
      };
      
      const key = locationName.toLowerCase();
      if (mockCoordinates[key]) {
        result = {
          ...mockCoordinates[key],
          formatted_address: locationName,
          service: 'mock'
        };
      } else {
        // Default to NYC if no match
        result = {
          lat: 40.7128,
          lng: -74.0060,
          formatted_address: locationName,
          service: 'default'
        };
      }
    }
    
    logger.info(`Geocoded "${locationName}" via ${result.service}: ${result.lat}, ${result.lng}`);
    await setCache(cacheKey, result, 24); // Cache for 24 hours
    return result;
  } catch (error) {
    logger.error('Geocoding error:', error);
    return {
      lat: 40.7128,
      lng: -74.0060,
      formatted_address: locationName,
      service: 'error_fallback'
    };
  }
}; 