const axios = require('axios');

// OpenRouteService API key (free tier: 2000 requests/day)
const ORS_API_KEY = process.env.ORS_API_KEY || '5b3ce3597851110001cf62481e8c3c52ba97401a8f3b4f8e8f8b4c8e'; // Free demo key

class LocationService {
  /**
   * Geocode an address using Nominatim (OpenStreetMap)
   * @param {string} address - The address to geocode
   * @returns {Object} - Object containing lat, lng, and formatted_address
   */
  static async geocodeAddress(address) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'Kisan-Cold-Keep-Bookings/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formatted_address: result.display_name
        };
      } else {
        throw new Error('No results found for the given address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} - Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  static toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Get distance and route using OpenRouteService
   * @param {number} startLat - Origin latitude
   * @param {number} startLon - Origin longitude
   * @param {number} endLat - Destination latitude
   * @param {number} endLon - Destination longitude
   * @returns {Object} - Distance and duration information
   */
  static async getRouteDistance(startLat, startLon, endLat, endLon) {
    try {
      const response = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car', {
        coordinates: [[startLon, startLat], [endLon, endLat]],
        format: 'json'
      }, {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          distance: `${(route.summary.distance / 1000).toFixed(1)} km`,
          distanceValue: route.summary.distance / 1000, // Convert to km
          duration: `${Math.round(route.summary.duration / 60)} min`,
          durationValue: route.summary.duration // in seconds
        };
      }
      throw new Error('Route calculation failed');
    } catch (error) {
      console.error('Route distance error:', error);
      // Fallback to straight-line distance
      const straightDistance = this.calculateDistance(startLat, startLon, endLat, endLon);
      return {
        distance: `${straightDistance} km`,
        distanceValue: straightDistance,
        duration: 'N/A',
        durationValue: null
      };
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} - Address information
   */
  static async reverseGeocode(lat, lon) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: lat,
          lon: lon,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'Kisan-Cold-Keep-Bookings/1.0'
        }
      });

      if (response.data) {
        return {
          formatted_address: response.data.display_name,
          city: response.data.address?.city || response.data.address?.town || response.data.address?.village,
          state: response.data.address?.state,
          country: response.data.address?.country
        };
      }
      throw new Error('Reverse geocoding failed');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }
}

module.exports = LocationService;
