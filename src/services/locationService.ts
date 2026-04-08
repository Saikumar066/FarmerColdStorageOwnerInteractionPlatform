export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export class LocationService {
  /**
   * Get user's current location using browser's geolocation API
   */
  static getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      console.log('🔍 Checking geolocation support...');
      
      if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('✅ Geolocation supported, requesting position...');
      
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Request location permission and get coordinates
   */
  static async requestLocationPermission(): Promise<LocationCoordinates | null> {
    try {
      const coords = await this.getCurrentLocation();
      console.log('✅ Location obtained:', coords);
      return coords;
    } catch (error) {
      console.error('❌ Location error:', error);
      return null;
    }
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  }
}
