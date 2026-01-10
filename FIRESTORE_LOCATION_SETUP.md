# Firestore Setup Guide - Location Tracking Collections

## Overview

This guide explains how to configure Firestore for location tracking, traffic analytics, and crowd detection.

## Collections Structure

### Collection 1: `activeLocations`

**Purpose:** Real-time user location tracking for current heatmap

**Document ID:** `{userId}`
```javascript
{
  userId: "user123" or "anonymous_abc123",
  latitude: -0.4133,
  longitude: 34.5620,
  accuracy: 15,                              // meters
  timestamp: Timestamp(2026-01-10T14:30:00),
  lastSeen: Timestamp(2026-01-10T14:35:00)
}
```

**Indexing:**
- Single field: `timestamp` (Descending) for real-time queries
- Single field: `lastSeen` (Descending) for cleanup queries
- Composite: `latitude`, `longitude` for geo-proximity (optional)

**Retention:**
- TTL: 24 hours (auto-delete old records)
- Trigger cleanup in Firestore Cloud Functions

**Size Estimate:**
- Per document: ~300 bytes
- 100 students × 2 updates/min = 288,000 docs/day
- Daily storage: ~85 MB (cleaned after 24h)

### Collection 2: `locationHistory`

**Purpose:** Historical location data for analytics and traffic pattern detection

**Document ID:** Auto-generated
```javascript
{
  userId: "user123",
  latitude: -0.4133,
  longitude: 34.5620,
  accuracy: 15,
  timestamp: Timestamp(2026-01-10T14:30:00),
  date: Timestamp(2026-01-10T00:00:00),      // For daily aggregation
  routeId: "route_abc123" (optional)          // For path tracking
}
```

**Indexing:**
- Single field: `timestamp` (Descending)
- Single field: `date` (Descending) for daily analysis
- Single field: `userId` (Ascending)
- Composite: `date`, `latitude`, `longitude`

**Retention:**
- Keep: 30-90 days (configurable)
- Archive: Export monthly to Cloud Storage
- Cleanup: Monthly Cloud Function job

**Size Estimate:**
- Per document: ~250 bytes
- 100 students × 288,000 updates/day = 72M bytes/day
- 30-day retention: ~2.2 GB
- Cost: ~$7-10/month storage

### Collection 3: `heatmapData` (Optional Pre-computed)

**Purpose:** Pre-computed hourly heatmaps for faster loading

**Document ID:** `heatmap_{date}_{hour}`
```javascript
{
  date: "2026-01-10",
  hour: 14,                                  // 0-23
  gridSize: 0.0005,                          // ~50m cells
  cells: [
    {
      lat: -0.4133,
      lon: 34.5620,
      count: 12,                             // People in this cell
      avgAccuracy: 18
    },
    // ... more cells
  ],
  totalPeople: 234,
  timestamp: Timestamp(2026-01-10T15:00:00)
}
```

**Retention:** Keep 12 months for trend analysis

## Security Rules

### Firestore Rules Setup

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Real-time locations - minimal data exposure
    match /activeLocations/{userId} {
      // Users can read their own location
      allow read: if request.auth.uid == userId;
      
      // Users can write their own location
      allow write: if request.auth.uid == userId;
      
      // Anonymous users: Allow read on aggregated data only
      allow read: if !request.auth.uid && request.query.limit <= 100;
    }
    
    // Location history - stricter access
    match /locationHistory/{document=**} {
      // Only authenticated users can read their own history
      allow read: if request.auth.uid == resource.data.userId;
      
      // Only write own location data
      allow write: if request.auth.uid == resource.data.userId;
      
      // Admin can read all for analytics
      allow read: if request.auth.token.admin == true;
    }
    
    // Pre-computed heatmaps - public read
    match /heatmapData/{document=**} {
      allow read: if true;  // Everyone can see aggregate heat
      allow write: if request.auth.token.admin == true;  // Only admin writes
    }
    
    // Crowded areas alerts
    match /crowdedAreas/{document=**} {
      allow read: if true;  // Public information
      allow write: if request.auth.token.admin == true;
    }
    
    // Popular routes analytics
    match /popularRoutes/{document=**} {
      allow read: if true;  // Public information
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## Cloud Functions for Data Management

### Function 1: Cleanup Old Location Data

**Purpose:** Delete activeLocations > 24 hours old

```javascript
// functions/cleanupActiveLocations.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.cleanupActiveLocations = functions
  .pubsub.schedule('every 1 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    
    // Get timestamp 24 hours ago
    const oneDayAgo = new admin.firestore.Timestamp(
      now.seconds - 86400,
      now.nanoseconds
    );
    
    // Delete old records
    const snapshot = await db.collection('activeLocations')
      .where('timestamp', '<', oneDayAgo)
      .get();
    
    let deleted = 0;
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      deleted++;
    });
    
    if (deleted > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deleted} old location records`);
    }
    
    return deleted;
  });
```

### Function 2: Archive Old Location History

**Purpose:** Move locationHistory > 30 days to Cloud Storage

```javascript
// functions/archiveLocationHistory.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();

exports.archiveLocationHistory = functions
  .pubsub.schedule('0 2 * * *')  // Daily at 2 AM
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date();
    
    // Archive data from 31 days ago
    const archiveDate = new Date(today);
    archiveDate.setDate(today.getDate() - 31);
    
    const dateStr = archiveDate.toISOString().split('T')[0];
    
    // Query records from 31 days ago
    const snapshot = await db.collection('locationHistory')
      .where('date', '==', admin.firestore.Timestamp.fromDate(
        new Date(dateStr + 'T00:00:00Z')
      ))
      .get();
    
    if (snapshot.empty) {
      console.log('No data to archive for ' + dateStr);
      return;
    }
    
    // Export to JSON and save to Cloud Storage
    const data = snapshot.docs.map(doc => doc.data());
    
    const fileName = `location-history/archive-${dateStr}.json`;
    await bucket.file(fileName).save(JSON.stringify(data));
    
    console.log(`Archived ${data.length} records to gs://bucket/${fileName}`);
    
    // Optional: Delete from Firestore after 30 days
    const deleteDate = new Date(today);
    deleteDate.setDate(today.getDate() - 60);
    
    const deleteSnapshot = await db.collection('locationHistory')
      .where('date', '<', admin.firestore.Timestamp.fromDate(deleteDate))
      .get();
    
    let deletedCount = 0;
    const batch = db.batch();
    deleteSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`Deleted ${deletedCount} archived records`);
    }
  });
```

### Function 3: Generate Hourly Heatmaps

**Purpose:** Pre-compute hourly heatmap data for performance

```javascript
// functions/generateHourlyHeatmap.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.generateHourlyHeatmap = functions
  .pubsub.schedule('0 * * * *')  // Every hour
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    
    // Get locations from last hour
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    const snapshot = await db.collection('locationHistory')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(oneHourAgo))
      .where('timestamp', '<=', admin.firestore.Timestamp.fromDate(now))
      .get();
    
    // Grid the data (50m cells)
    const gridSize = 0.0005;  // Approximately 50m
    const grid = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const gridKey = 
        Math.floor(data.latitude / gridSize) + ',' +
        Math.floor(data.longitude / gridSize);
      
      if (!grid[gridKey]) {
        grid[gridKey] = {
          lat: Math.floor(data.latitude / gridSize) * gridSize,
          lon: Math.floor(data.longitude / gridSize) * gridSize,
          count: 0,
          accuracies: []
        };
      }
      
      grid[gridKey].count++;
      grid[gridKey].accuracies.push(data.accuracy);
    });
    
    // Convert to array and save
    const cells = Object.values(grid).map(cell => ({
      lat: cell.lat,
      lon: cell.lon,
      count: cell.count,
      avgAccuracy: cell.accuracies.reduce((a, b) => a + b) / cell.accuracies.length
    }));
    
    // Save heatmap
    const hour = now.getHours();
    const dateStr = now.toISOString().split('T')[0];
    const docId = `heatmap_${dateStr}_${hour}`;
    
    await db.collection('heatmapData').doc(docId).set({
      date: dateStr,
      hour: hour,
      gridSize: gridSize,
      cells: cells,
      totalPeople: snapshot.size,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Generated heatmap for hour ${hour} with ${cells.length} cells`);
  });
```

### Function 4: Detect Crowded Areas in Real-Time

**Purpose:** Alert staff when areas become crowded

```javascript
// functions/detectCrowdedAreas.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.onLocationUpdate = functions
  .firestore.document('activeLocations/{userId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const data = change.after.data();
    
    if (!data) return;  // Deletion
    
    // Check crowd density around this location (100m radius)
    const radius = 0.0009;  // ~100m
    
    const snapshot = await db.collection('activeLocations')
      .where('latitude', '>=', data.latitude - radius)
      .where('latitude', '<=', data.latitude + radius)
      .where('longitude', '>=', data.longitude - radius)
      .where('longitude', '<=', data.longitude + radius)
      .get();
    
    const count = snapshot.size;
    
    // Threshold: 10+ people = crowded
    if (count >= 10) {
      // Save to crowdedAreas collection
      await db.collection('crowdedAreas').doc(`area_${context.params.userId}`).set({
        latitude: data.latitude,
        longitude: data.longitude,
        crowdCount: count,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        severity: count < 15 ? 'medium' : 'high'
      });
      
      // Optional: Send alert to staff
      // await notifyStaff(`Crowd of ${count} detected at ${data.latitude}, ${data.longitude}`);
    }
  });
```

## Deployment Instructions

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:cleanupActiveLocations
```

### 3. Enable TTL Policy (Optional)

For automatic deletion of activeLocations after 24h:

```bash
# Create TTL policy
gcloud firestore databases patch --region=us-central1 \
  --enable-delete-field-ttl
```

## Monitoring & Costs

### Cost Estimation

**For 100 students tracking for 24 hours:**

| Operation | Count | Cost |
|-----------|-------|------|
| Writes (activeLocations) | 288,000 | $1.44 |
| Reads (heatmap queries) | 1,000 | $0.30 |
| Reads (analytics) | 500 | $0.15 |
| **Daily Total** | | **$1.89** |
| **Monthly Total** | | **$56.70** |
| **Annual Total** | | **$680** |

**Storage:**
- activeLocations: ~85MB (cleaned daily) = $0/month
- locationHistory: ~2.2GB (30-day retention) = $0.44/month
- heatmapData: ~50MB/month = $0.50/month

**Total Monthly: ~$60-70**

### Firebase Console Monitoring

1. Go to: Firebase Console > Project > Firestore Database
2. Check metrics:
   - **Operations tab:** Read/write counts
   - **Data tab:** Collection sizes
   - **Indexes tab:** Query efficiency
3. Set up alerts:
   - Firebase Console > Settings > Alerts
   - Alert on: High read/write rates, storage growth

## Testing

### Test Location Tracking

```javascript
// In browser console:

// Check if tracking works
await LocationTracking.startTracking(30000);

// Verify Firestore writes
// Go to Firebase Console > Firestore Database > activeLocations
// Should see new document with your userId

// Get current location
console.log(LocationTracking.getCurrentLocation());

// Test heatmap
await HeatmapAnalytics.drawHeatmap(window.mapInstance);

// Check crowd detection
const isCrowded = await LocationTracking.isInCrowdedArea(-0.4133, 34.5620);
console.log('Is crowded:', isCrowded);
```

### Test Cloud Functions

```bash
# List deployed functions
firebase functions:list

# View function logs
firebase functions:log

# Test specific function
firebase functions:call cleanupActiveLocations
```

## Next Steps

1. ✅ Create collections (empty, documents added via app)
2. ✅ Deploy Firestore rules
3. ✅ Deploy Cloud Functions (optional but recommended)
4. ✅ Enable location tracking in app
5. ✅ Monitor Firestore metrics
6. ✅ Test with 5-10 users
7. ✅ Scale to full campus

---

**Questions?** See LOCATION_TRACKING_GUIDE.md for API reference.
