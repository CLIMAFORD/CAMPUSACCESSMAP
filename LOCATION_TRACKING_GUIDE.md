# Smart Campus Access Map - Location Tracking & Directions Guide

## Overview

Your Smart Campus Access Map now includes advanced location tracking, directions/routing, and traffic analysis capabilities. These features help users navigate campus while understanding real-time crowd patterns and accessibility issues.

## New Features

### 1. **Real-Time Location Tracking**

Users can enable location tracking to help analyze campus traffic patterns:

```javascript
// Start tracking location
LocationTracking.startTracking(30000); // Updates every 30 seconds

// Get current location
const location = LocationTracking.getCurrentLocation();
// Returns: { latitude, longitude, accuracy, timestamp, userId }

// Stop tracking
LocationTracking.stopTracking();
```

**Data Stored in Firebase:**
- `activeLocations` collection - Current user positions (real-time)
- `locationHistory` collection - Historical location data for analytics

**Privacy:**
- Users explicitly enable tracking via checkbox
- Anonymous tracking option available for non-authenticated users
- Automatic cleanup of old location data (30+ days)

### 2. **Directions & Routing**

Get turn-by-turn directions between campus locations:

```javascript
// Basic route
const route = await Directions.getRoute(startLat, startLon, endLat, endLon);
// Returns: { distance, timeMinutes, waypoints, instructions, isCrowded }

// Accessible route (wheelchair-friendly)
const accessibleRoute = await Directions.getAccessibleRoute(startLat, startLon, endLat, endLon);

// Draw route on map
Directions.drawRouteOnMap(mapInstance, route);

// Clear route
Directions.clearRoute(mapInstance);
```

**Features:**
- Distance calculation using Haversine formula
- Travel time estimation based on:
  - Base walking speed (1.4 m/s) or wheelchair speed (0.9 m/s)
  - Crowd density penalty (30-50% slower in crowded areas)
  - Accuracy estimates based on distance and terrain

- Accessibility options:
  - Wheelchair-friendly routes
  - Elevator and ramp detection
  - Tactile guide availability

**Travel Time Examples:**
- 500m walk: 6 minutes (normal), 9 minutes (wheelchair)
- Same route in crowded area: +30-50% travel time

### 3. **Real-Time Heatmap & Traffic Visualization**

Visualize campus crowd density and traffic patterns:

```javascript
// Draw heatmap of user locations
await HeatmapAnalytics.drawHeatmap(mapInstance);

// Show crowd density circles
await HeatmapAnalytics.drawCrowdDensity(mapInstance);

// Get traffic analysis
const analysis = await HeatmapAnalytics.analyzeTraffic(mapInstance);
// Returns: { totalPeopleOnCampus, crowdedAreasCount, popularRoutes }

// Get crowd level at specific location
const level = await HeatmapAnalytics.getCrowdLevel(lat, lon);
// Returns: { level: 'low'|'medium'|'high', description, color }
```

**Heatmap Colors:**
- 🟢 Green: Low traffic (< 3 people)
- 🟡 Yellow: Moderate traffic (3-10 people)
- 🟠 Orange: Crowded (10-20 people)
- 🔴 Red: Very crowded (> 20 people)

**Data Sources:**
- Real-time from `activeLocations` collection
- Historical from `locationHistory` collection
- Updates every 2 minutes automatically

### 4. **Crowded Area Detection**

Identify bottlenecks and traffic hotspots:

```javascript
// Get all crowded areas (threshold: 5+ people)
const crowdedAreas = await LocationTracking.getCrowdedAreas(5);

// Check if specific location is crowded
const isCrowded = await LocationTracking.isInCrowdedArea(lat, lon, 100); // 100m radius

// Get popular routes/paths
const routes = await LocationTracking.getPopularRoutes(24); // Last 24 hours
```

**Use Cases:**
- Route around crowded hallways
- Identify bottlenecks for maintenance
- Plan facility improvements
- Analyze peak traffic times

## UI Components

### Directions Tab

**Location Input Fields:**
```
From: [Use My Location] [Shows current location]
To:   [Enter destination coordinates]
```

**Route Options:**
- ✓ Wheelchair Accessible - Prefers accessible paths
- ✓ Avoid Crowded Areas - Routes around congestion

**Output:**
- Route summary card with distance and travel time
- Turn-by-turn instructions
- Crowding warnings
- Route drawn on map with colored polyline

### Traffic Tab

**Features:**
- Toggle Heatmap visualization
- Toggle Crowd Density circles
- Real-time traffic statistics
- Top 5 popular routes
- Crowded areas alert
- Color-coded legend

**Refresh Button:** Updates traffic data on demand

**Auto-Updates:** Every 2 minutes if enabled

## Database Schema

### `activeLocations` Collection
```javascript
{
    userId: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    timestamp: Timestamp,
    lastSeen: Timestamp
}
```

### `locationHistory` Collection
```javascript
{
    userId: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    timestamp: Timestamp,
    date: Timestamp (midnight of day)
}
```

## API Reference

### LocationTracking Module

```javascript
// Start/Stop tracking
LocationTracking.startTracking(intervalMs)        // Returns: boolean
LocationTracking.stopTracking()                   // Returns: void

// Get current state
LocationTracking.getCurrentLocation()             // Returns: location object
LocationTracking.isCurrentlyTracking()            // Returns: boolean

// Subscriber pattern
LocationTracking.subscribe(callback)              // Returns: unsubscribe function

// Queries
LocationTracking.getCrowdDensity(lat, lon, radius)   // radius in meters
LocationTracking.getHeatmapData(bounds)              // leaflet bounds
LocationTracking.getPopularRoutes(hoursBack)         // default 24
LocationTracking.getCrowdedAreas(threshold)          // threshold count
LocationTracking.isInCrowdedArea(lat, lon, threshold)

// Utilities
LocationTracking.calculateDistance(lat1, lon1, lat2, lon2)  // meters
```

### Directions Module

```javascript
// Routing
Directions.getRoute(startLat, startLon, endLat, endLon, options)
Directions.getAccessibleRoute(startLat, startLon, endLat, endLon)

// Visualization
Directions.drawRouteOnMap(mapInstance, route)
Directions.clearRoute(mapInstance)

// Information
Directions.getCurrentRoute()                       // Returns: current route object
Directions.getRouteInfoCard(route)                 // Returns: HTML card

// Calculations
Directions.calculateDistance(lat1, lon1, lat2, lon2)
Directions.estimateTravelTime(distance, options)
Directions.calculateBearing(lat1, lon1, lat2, lon2)
```

### HeatmapAnalytics Module

```javascript
// Initialization
HeatmapAnalytics.initializeHeatmap()              // Returns: Promise<boolean>

// Visualization
HeatmapAnalytics.drawHeatmap(mapInstance)
HeatmapAnalytics.drawCrowdDensity(mapInstance)
HeatmapAnalytics.toggleHeatmap(mapInstance, enabled)
HeatmapAnalytics.toggleCrowdDensity(mapInstance, enabled)
HeatmapAnalytics.updateHeatmap(mapInstance)       // Refresh both

// Analysis
HeatmapAnalytics.analyzeTraffic(mapInstance)      // Returns: analysis object
HeatmapAnalytics.getCrowdLevel(lat, lon)          // Returns: level object
HeatmapAnalytics.getTrafficCard(mapInstance)      // Returns: HTML card
HeatmapAnalytics.getHistoricalTraffic(startDate, endDate)
```

## Usage Examples

### Example 1: Get Directions with Accessibility

```javascript
// User wants accessible route avoiding crowds
const wheelchairAccessible = true;
const avoidCrowded = true;

const route = await Directions.getRoute(
    -0.4133,  // Start lat
    34.5620,  // Start lon
    -0.4100,  // End lat
    34.5650,  // End lon
    { wheelchair: wheelchairAccessible, avoidCrowded }
);

if (route.isCrowded) {
    SmartCampusNotifications.show(
        'Route Advisory',
        'This route passes through a crowded area. Travel time +30% expected.',
        'warning'
    );
}

Directions.drawRouteOnMap(window.mapInstance, route);
```

### Example 2: Monitor Crowd Density

```javascript
// Check if specific building is crowded
const buildingLat = -0.4133;
const buildingLon = 34.5620;

const isCrowded = await LocationTracking.isInCrowdedArea(
    buildingLat, 
    buildingLon, 
    100  // Check 100m radius
);

if (isCrowded) {
    console.log('⚠️ Building entrance is crowded');
}

// Get detailed density info
const density = await LocationTracking.getCrowdDensity(
    buildingLat, 
    buildingLon, 
    50   // 50m radius
);
console.log(`People nearby: ${density.density}, Level: ${density.level}`);
```

### Example 3: Analyze Traffic Patterns

```javascript
// Get traffic analysis for current map view
const analysis = await HeatmapAnalytics.analyzeTraffic(window.mapInstance);

console.log(`Total on campus: ${analysis.totalPeopleOnCampus}`);
console.log(`Crowded areas: ${analysis.crowdedAreasCount}`);

// Show bottleneck alerts
analysis.crowdedAreas.forEach(area => {
    console.log(`Bottleneck at (${area.lat}, ${area.lng}): ${area.count} people`);
});

// Recommend optimal routes
const routes = analysis.popularRoutes;
console.log('Top 5 popular routes this week:', routes);
```

### Example 4: Real-Time Location Tracking

```javascript
// User enables location sharing
LocationTracking.startTracking(30000); // Update every 30 seconds

// Subscribe to location updates
const unsubscribe = LocationTracking.subscribe((location) => {
    console.log(`📍 User at: ${location.latitude}, ${location.longitude}`);
    console.log(`Accuracy: ${location.accuracy}m`);
    
    // Check if now in crowded area
    const isCrowded = await LocationTracking.isInCrowdedArea(
        location.latitude,
        location.longitude
    );
    
    if (isCrowded) {
        // Suggest alternate route
        SmartCampusNotifications.show(
            'Crowding Detected',
            'Try alternate route to avoid congestion',
            'warning'
        );
    }
});

// Later: Stop tracking
unsubscribe();
LocationTracking.stopTracking();
```

## Performance Considerations

### Firestore Queries (Cost Optimization)

**Reading location data:**
- activeLocations: 1 read per update (real-time listener)
- locationHistory: 1 read per historical query

**Estimate for 100 students:**
- 100 location updates/30sec = 12,000/hour = 288,000/day
- Cost at Firestore rates: ~$0.06/day

**Recommendations:**
- Use `stopTracking()` when not needed
- Increase tracking interval to 60+ seconds
- Archive old location history monthly
- Set Firestore TTL policy: 30-90 days

### Heatmap Performance

**Large datasets (1000+ locations):**
- Rendering optimized with Leaflet.heat clustering
- Heatmap rebuilds only on map pan/zoom
- Crowd density updates every 2 minutes (configurable)

**Mobile considerations:**
- Reduce heatmap intensity on mobile
- Increase update interval (60+ seconds)
- Disable historic data on mobile by default

## Privacy & Security

### User Consent

✅ **Explicit opt-in** via checkbox
- No automatic location tracking
- Users control when tracking is active
- Can disable anytime

### Data Handling

✅ **Firestore security rules** (example):
```javascript
// Only users can read their own location data
match /activeLocations/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}

// Anonymous users can see aggregated data only
match /heatmapData/{document=**} {
  allow read: if true;  // Public heatmap only
}
```

✅ **Automatic data cleanup:**
- activeLocations: Expires after 24 hours
- locationHistory: Archived/deleted after 30-90 days

### GDPR Compliance

- ✅ User consent (checkbox)
- ✅ Data minimization (only location, timestamp, user ID)
- ✅ Retention limits (30-90 days)
- ✅ User can request deletion
- ✅ No third-party sharing

## Troubleshooting

### Location Permission Issues

**Problem:** "Location permission denied"
```
Solution:
1. Chrome Settings > Privacy and Security > Site Settings > Location
2. Ensure Smart Campus Access Map has "Allow" permission
3. Refresh page and try again
```

### Heatmap Not Showing

**Problem:** Heatmap layer missing
```
// Check if library loaded
if (typeof L.heatLayer !== 'function') {
    console.error('Leaflet.heat not loaded');
    // Verify script tag in HTML
}

// Manually initialize
HeatmapAnalytics.initializeHeatmap()
    .then(initialized => {
        if (initialized) {
            HeatmapAnalytics.drawHeatmap(window.mapInstance);
        }
    });
```

### Inaccurate Travel Times

**Problem:** Estimated time doesn't match actual
```
Factors affecting accuracy:
- GPS accuracy (shown in location)
- Walking speed variations
- Crowd density changes in real-time
- Building layout complexity

Solution:
- Check GPS accuracy (target: < 10m)
- Enable "Avoid Crowded Areas" for real-time delays
- Use popular routes as baseline
```

### Firebase Connection Issues

**Problem:** Location data not syncing
```
// Check Firebase status
if (!FIREBASE_ENABLED) {
    console.log('Firebase not configured');
}

// Verify Firestore connection
const db = firebase.firestore();
db.collection('activeLocations').get()
    .then(snap => console.log(`Connected: ${snap.size} documents`))
    .catch(err => console.error('Firestore error:', err));
```

## Integration with Accessibility Reports

When a user reports an accessibility issue, the system automatically:

1. **Adds crowding data** to the issue record
2. **Suggests alternate routes** if in crowded area
3. **Notifies responders** of location popularity
4. **Tracks resolution impact** on traffic patterns

Example:
```javascript
// When issue is created, add crowd data
const issue = {
    type: 'blocked-ramp',
    location: { lat, lon },
    severity: 'high',
    crowdLevel: (await HeatmapAnalytics.getCrowdLevel(lat, lon)).level,
    nearPopularRoute: (await LocationTracking.getPopularRoutes()).length > 0
};
```

## Next Steps

1. **Test Location Tracking:** Enable tracking and verify data in Firestore
2. **Create Test Routes:** Enter coordinates and test directions UI
3. **Monitor Traffic:** Open Traffic tab and watch heatmap updates
4. **Integrate with Issues:** Link crowd data to accessibility reports
5. **Deploy:** Push to Firebase Hosting when ready

## Support

For issues or questions:
- Check browser console (F12) for error messages
- Verify Firestore database connection
- Review Firebase quota usage
- Contact campus IT support

---

**Last Updated:** January 2026
**Module Versions:** 
- Location Tracking 1.0
- Directions 1.0
- Heatmap Analytics 1.0
