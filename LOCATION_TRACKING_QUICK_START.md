# Location Tracking & Directions - Quick Start

## What's New? 🎯

Your Smart Campus Access Map now has:
- ✅ Real-time location tracking
- ✅ Directions with travel time
- ✅ Traffic heatmaps showing crowded areas
- ✅ Crowd-aware route suggestions
- ✅ Popular route analytics

## 3 Quick Features

### 1️⃣ Enable Location Tracking

```
Directions Tab → Toggle "Enable Location Tracking"
```

Your location is shared (with your permission) to:
- Help others avoid crowded areas
- Analyze campus traffic patterns
- Improve accessibility planning

**Privacy:** Data is anonymous and auto-deletes after 30 days.

### 2️⃣ Get Directions

```
Directions Tab
├─ Click "Use My Location" (or enter start point)
├─ Enter destination coordinates
├─ Check "Wheelchair Accessible" if needed
├─ Check "Avoid Crowded Areas" to skip bottlenecks
└─ Click "Get Directions"
```

**Output:**
- Distance in km
- Travel time (accounts for crowd delays)
- Turn-by-turn instructions
- Visual route on map

### 3️⃣ View Traffic Heatmap

```
Traffic Tab
├─ Toggle "Show Heatmap" to see crowd density
├─ Toggle "Show Crowd Density" for bottleneck circles
└─ Click "Refresh Traffic Data" for latest update
```

**Legend:**
- 🟢 Green = Low traffic
- 🟡 Yellow = Moderate traffic
- 🟠 Orange = Crowded
- 🔴 Red = Very crowded

## How It Works

### Data Flow
```
User Enables Tracking
         ↓
Location → Firebase (every 30 seconds)
         ↓
Heatmap Updated (every 2 minutes)
         ↓
Smart Route Suggestions
```

### Travel Time Formula
```
Base Time = Distance ÷ Walking Speed (1.4 m/s)

Adjustments:
- Wheelchair: Add 40% time
- Crowded area: Add 30-50% time
- Good accessibility: Reduce 10%

Example: 500m in crowded area
= 357 seconds ÷ 1.0 × 1.3 (crowd)
= 464 seconds = 7.7 minutes
```

## Coordinates Format

**How to enter locations:**

Option 1: Use "My Location" button
- Automatic GPS detection
- Shows in format: -0.4133, 34.5620

Option 2: Manual entry
- Use: `latitude, longitude`
- Example: `-0.4133, 34.5620`
- Get coords from map hover

Option 3: Click on map (future feature)
- Coming soon!

## Firestore Data

### Two Collections

**activeLocations**
- Real-time user positions
- Updates every 30 seconds
- Auto-deletes after 24 hours
- Used for: Current heatmap, crowd detection

**locationHistory**
- Historical trail of movements
- Updates continuously while tracking
- Keeps 30-90 days
- Used for: Traffic pattern analysis, peak hour detection

### Data Stored Per Update
```javascript
{
  userId: "user123",              // Anonymous or Firebase ID
  latitude: -0.4133,
  longitude: 34.5620,
  accuracy: 15,                   // meters
  timestamp: "2026-01-10T14:30:00"
}
```

## Usage Scenarios

### Scenario 1: Getting to Class
```
1. Enable Location Tracking (help analyze campus traffic)
2. Go to Directions tab
3. Enter class building coordinates
4. Check "Avoid Crowded Areas"
5. Follow route shown on map
6. GPS accounts for crowd delays automatically
```

### Scenario 2: Accessibility Issue in Crowded Area
```
1. You see blocked ramp during peak hours
2. Report Issue → note location
3. System detects: High crowd density
4. Alert: "This is a high-traffic area"
5. Suggests maintenance during low-traffic hours
6. Tracks if fixing it improves traffic flow
```

### Scenario 3: Campus Planner Analysis
```
1. Open Traffic tab
2. View popular routes (last 24 hours)
3. Identify bottlenecks
4. Plan facility improvements
5. Deploy signs or accessible routes
6. Monitor impact on traffic flow
```

## Settings & Controls

### Location Tracking Tab
```
Enable Location Tracking    [Toggle switch]
├─ Privacy: Anonymous, auto-deletes 30 days
└─ Accuracy: ~10-30 meters

From Location Input         [Your location / Manual entry]
├─ Button: "Use My Location" [Auto-fill GPS]
└─ Shows: -0.4133, 34.5620

To Location Input           [Enter destination]
└─ Shows: -0.4100, 34.5650

Route Options               [Checkboxes]
├─ Wheelchair Accessible   [Adds 40% time, prefers ramps]
└─ Avoid Crowded Areas     [Routes around busy areas]

Button: Get Directions      [Calculate & draw route]
├─ Output: Distance & time estimate
├─ Map: Blue route drawn
└─ Instructions: Step-by-step directions
```

### Traffic Tab
```
Show Heatmap                [Toggle switch]
├─ Real-time crowd density visualization
└─ Updates every 2 minutes

Show Crowd Density          [Toggle switch]
├─ Colored circles show bottleneck severity
└─ Hover for people count

Refresh Traffic Data        [Button]
└─ Manual update, auto-refreshes every 2 min

Statistics Card
├─ Total people on campus
├─ Number of crowded areas
├─ Top 5 popular routes
└─ Bottleneck alerts

Traffic Legend              [Color reference]
├─ Green = Low traffic
├─ Yellow = Moderate
├─ Orange = Crowded
└─ Red = Very crowded
```

## Performance & Battery

### Phone Battery Impact
- **Location tracking uses:**
  - GPS: ~10% battery/hour (accurate)
  - WiFi: ~2% battery/hour (less accurate)

- **Optimization tips:**
  - Disable when not needed
  - Use 60-second intervals instead of 30
  - Enable WiFi for better battery life

- **Mobile data:**
  - ~1MB per 8 hours of tracking
  - Works offline (syncs when connected)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Location permission denied" | Android/iOS: Settings → Apps → Location → Allow |
| Heatmap not showing | Refresh page, check Leaflet.heat script loaded |
| Travel time too high | Could be in crowded area, check traffic tab |
| Directions not drawing | Verify coordinates format: `-0.4133, 34.5620` |
| Location not updating | Enable location tracking, check GPS enabled |

## API Endpoints (For Developers)

```javascript
// Start tracking
LocationTracking.startTracking(30000);

// Get current location
const loc = LocationTracking.getCurrentLocation();

// Calculate route
const route = await Directions.getRoute(lat1, lon1, lat2, lon2);

// Get crowd level
const level = await HeatmapAnalytics.getCrowdLevel(lat, lon);

// Get crowded areas
const areas = await LocationTracking.getCrowdedAreas(5);
```

## Privacy Promise

✅ **Your privacy is protected:**
- Location tracking is **opt-in only**
- Data is **anonymous** (no names attached)
- Stored only **30-90 days** max
- Can **disable anytime**
- **Not shared** with third parties
- **Complies with** GDPR & privacy laws

## Next Steps

1. **Try it:** Enable location tracking
2. **Test directions:** Enter two campus locations
3. **View traffic:** Check Heatmap and Crowd Density
4. **Report issue:** See how crowd data helps
5. **Share feedback:** Let us know what helps you!

---

## One More Thing 💡

**Incentive Analysis Tip:**

Use crowd data to improve campus:
- Move accessibility resources to crowded areas
- Schedule maintenance during low-traffic hours
- Create alternate routes through less-crowded paths
- Reward high-traffic area improvements
- Track incentive program impact on accessibility

Example:
```
Issue fixed in crowded hallway
→ Monitor traffic after fix
→ If traffic improves, incentive success
→ Scale solution to other areas
```

---

**Questions?** Check LOCATION_TRACKING_GUIDE.md for full documentation.
