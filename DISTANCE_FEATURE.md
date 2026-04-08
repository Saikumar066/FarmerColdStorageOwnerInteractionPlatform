# Distance Calculation Feature - Implementation Guide

This document outlines the implementation of the distance calculation feature for the Kisan Cold Keep Bookings platform.

## 🎯 Feature Overview

The distance calculation feature allows farmers to:

- See the distance between their location and available cold storage facilities
- Get storages sorted by proximity (closest first)
- Make informed decisions based on location convenience

## 🔧 Implementation Components

### 1. Database Changes

- **Added to `farmers` table**: `latitude`, `longitude` columns (DECIMAL type)
- **Added to `cold_storages` table**: `latitude`, `longitude` columns (DECIMAL type)

### 2. Backend Services

#### LocationService (`backend/services/locationService.js`)

- **geocodeAddress()**: Converts addresses to coordinates using Google Maps API
- **calculateDistance()**: Uses Haversine formula for distance calculation
- **getDistanceMatrix()**: Uses Google Maps Distance Matrix API for road distances

#### Updated Routes

- **`/api/farmers/register`**: Now accepts and stores latitude/longitude coordinates
- **`/api/storages`**: Returns storages with calculated distances when farmer coordinates provided

### 3. Frontend Services

#### LocationService (`src/services/locationService.ts`)

- **getCurrentLocation()**: Uses browser geolocation API
- **requestLocationPermission()**: Handles location permission requests
- **calculateDistance()**: Client-side distance calculation
- **formatDistance()**: Formats distance for display

### 4. UI Components

#### Registration Form Updates

- Added geolocation button for automatic location capture
- Shows captured coordinates confirmation
- Fallback to manual address entry

#### Dashboard Updates

- Displays distances on storage cards
- Sorts storages by proximity
- Enhanced storage card design with prominent distance display

## 🔑 Configuration Required

### Google Maps API Setup

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Enable required APIs:
   - Geocoding API
   - Distance Matrix API
3. Add API key to `.env` file:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Environment Variables

Create `.env` file in backend directory with:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=AgroChillBookingDB
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PORT=5000
NODE_ENV=development
```

## 🚀 Usage Flow

### Farmer Registration

1. Farmer fills registration form
2. Clicks location button to capture GPS coordinates
3. System stores coordinates with farmer data
4. If GPS fails, farmer can still register with manual address

### Dashboard Experience

1. System fetches farmer's coordinates from database
2. Requests storage list with farmer location parameters
3. Backend calculates distances using stored coordinates
4. Returns sorted list (closest first)
5. Frontend displays distances prominently on storage cards

### Storage Creation (Manager)

1. Manager creates new storage
2. System attempts to geocode storage address
3. Stores coordinates for future distance calculations
4. Falls back gracefully if geocoding fails

## 📊 Distance Calculation Methods

### 1. Haversine Formula (Default)

- Calculates "as the crow flies" distance
- Fast and reliable
- Used when Google API unavailable

### 2. Google Distance Matrix API (Optional)

- Provides road distance and travel time
- More accurate for navigation
- Requires API quota management

## 🔄 Migration & Updates

### Database Schema Update

Run the following script to add location columns:

```bash
node updateLocationSchema.js
```

This adds:

- `farmers.latitude` (DECIMAL(10,8))
- `farmers.longitude` (DECIMAL(11,8))
- `cold_storages.latitude` (DECIMAL(10,8))
- `cold_storages.longitude` (DECIMAL(11,8))

## 🛡️ Error Handling

### Frontend

- Graceful fallback when geolocation denied
- User-friendly error messages
- Manual location entry always available

### Backend

- Continues without coordinates if geocoding fails
- Returns "N/A" distance when coordinates unavailable
- Maintains functionality without Google API

## 🔮 Future Enhancements

1. **Map Integration**: Add interactive maps showing storage locations
2. **Route Planning**: Integrate turn-by-turn navigation
3. **Radius Filtering**: Allow farmers to set maximum distance preferences
4. **Location Accuracy**: Improve geocoding with address validation
5. **Offline Support**: Cache distances for offline viewing

## 🧪 Testing

### Manual Testing Steps

1. Register new farmer with location permission
2. Check database for stored coordinates
3. Visit dashboard and verify distance display
4. Test with location permission denied
5. Create new storage and verify geocoding

### API Testing

```bash
# Test storage endpoint with coordinates
curl "http://localhost:5000/api/storages?farmer_lat=28.6139&farmer_lng=77.2090"

# Test farmer registration with coordinates
curl -X POST http://localhost:5000/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "phone": "9876543210",
    "location": "Delhi, India",
    "password": "password123",
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

## 📝 Notes

- Distance calculations are cached during API request
- Coordinates are optional - system works without them
- Google API costs should be monitored for production use
- Location privacy should be clearly communicated to users
