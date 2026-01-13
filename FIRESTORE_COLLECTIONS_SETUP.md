# Firestore Collections Setup Guide

This document outlines all required Firestore collections for the Smart Campus Access application.

## Overview

The application uses the following Firestore collections:

1. **issues** - Campus issue reports (accessibility, maintenance, etc.)
2. **notifications** - User notifications related to issues
3. **activeLocations** - Real-time tracking of active users
4. **locationHistory** - Historical location data for heatmap and analysis
5. **_metadata** - System metadata (connection state, sync info)

---

## Collection Structures

### 1. **issues** Collection

Stores campus accessibility and maintenance issue reports.

**Document ID**: Auto-generated

**Fields**:
- `title` (string) - Issue title
- `description` (string) - Detailed description
- `category` (string) - Issue category (accessibility, maintenance, safety, etc.)
- `latitude` (number) - Issue location latitude
- `longitude` (number) - Issue location longitude
- `status` (string) - Issue status: "open", "in-progress", "resolved"
- `priority` (string) - Priority level: "low", "medium", "high", "critical"
- `reportedBy` (string) - User ID who reported
- `reportedAt` (timestamp) - When issue was reported
- `updatedAt` (timestamp) - Last update time
- `deleted` (boolean) - Soft delete flag (default: false)
- `attachments` (array) - File references/URLs
- `comments` (array) - Issue comments/updates
- `resolution` (string) - Resolution details (optional)
- `resolvedAt` (timestamp) - When issue was resolved (optional)
- `location` (map) - Geo-location object
  - `address` (string)
  - `building` (string)
  - `floor` (string)

**Indexes Recommended**:
- Composite: `status` + `priority` + `reportedAt` (DESC)
- Composite: `deleted` + `status` + `updatedAt` (DESC)
- Single: `category`
- Single: `latitude`, `longitude` (for geo-queries)

---

### 2. **notifications** Collection

Stores user notifications about issue updates.

**Document ID**: Auto-generated

**Fields**:
- `userId` (string) - Recipient user ID
- `issueId` (string) - Related issue ID
- `type` (string) - Notification type: "issue-update", "issue-resolved", "comment", "mention"
- `title` (string) - Notification title
- `message` (string) - Notification message
- `read` (boolean) - Whether notification was read (default: false)
- `createdAt` (timestamp) - When notification was created
- `readAt` (timestamp) - When user read notification (optional)
- `actionUrl` (string) - Link to related content (optional)
- `priority` (string) - Notification priority: "low", "normal", "high"

**Indexes Recommended**:
- Composite: `userId` + `read` + `createdAt` (DESC)
- Composite: `userId` + `createdAt` (DESC)
- Single: `issueId`

---

### 3. **activeLocations** Collection

Real-time tracking of user locations on campus.

**Document ID**: User ID (or session ID)

**Fields**:
- `userId` (string) - User identifier
- `sessionId` (string) - Session/device identifier
- `latitude` (number) - Current latitude
- `longitude` (number) - Current longitude
- `accuracy` (number) - GPS accuracy in meters
- `heading` (number) - Direction heading (0-360°, optional)
- `speed` (number) - Movement speed in m/s (optional)
- `deviceInfo` (map) - Device information
  - `userAgent` (string)
  - `platform` (string)
  - `browser` (string)
- `lastUpdated` (timestamp) - When location was last updated
- `isActive` (boolean) - Whether user is currently active (default: true)

**Indexes Recommended**:
- Single: `lastUpdated` (DESC) - for finding recent locations
- Single: `isActive`

---

### 4. **locationHistory** Collection

Historical location data for heatmap, traffic analysis, and movement patterns.

**Document ID**: Auto-generated

**Fields**:
- `userId` (string) - User identifier (anonymous for privacy)
- `latitude` (number) - Location latitude
- `longitude` (number) - Location longitude
- `timestamp` (timestamp) - When location was recorded
- `accuracy` (number) - GPS accuracy in meters
- `speed` (number) - Speed at this point (optional)
- `heading` (number) - Direction heading (optional)
- `area` (string) - Campus area/zone (e.g., "Academic Block", "Library", "Parking")
- `deviceId` (string) - Anonymous device identifier
- `sessionId` (string) - Session identifier
- `day` (string) - Day of week (YYYY-MM-DD format, for daily rollups)
- `hour` (number) - Hour of day (0-23, for hourly analysis)

**Indexes Recommended**:
- Composite: `area` + `timestamp` (DESC)
- Composite: `day` + `hour` + `area`
- Single: `timestamp` (DESC) - for real-time heatmap
- Single: `userId` + `timestamp` (for personal history)

---

### 5. **_metadata** Collection

System metadata for connection state, sync info, and configuration.

**Document ID**: Various metadata keys

#### Document: `connection`

Real-time connection state indicator.

**Fields**:
- `state` (string) - "connected" or "disconnected"
- `timestamp` (timestamp) - When state changed
- `lastSeen` (timestamp) - Last active timestamp

#### Document: `syncStatus`

Synchronization status between offline and cloud.

**Fields**:
- `lastSyncTime` (timestamp) - When last sync occurred
- `pendingSyncCount` (number) - Number of pending syncs
- `lastErrorMessage` (string) - Last sync error (optional)
- `isAutoSyncEnabled` (boolean) - Whether auto-sync is active

#### Document: `config`

Application configuration flags.

**Fields**:
- `maintenanceMode` (boolean) - Whether app is in maintenance
- `featureFlags` (map) - Feature toggle flags
  - `heatmapEnabled` (boolean)
  - `directionsEnabled` (boolean)
  - `notificationsEnabled` (boolean)
  - `exportEnabled` (boolean)
- `version` (string) - Current app version
- `lastUpdated` (timestamp)

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow read/write to issues for authenticated users
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.reportedBy || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Allow read/write to notifications for own notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Allow read/write to active locations (real-time)
    match /activeLocations/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.uid == userId || isAdmin());
    }
    
    // Allow read to location history, write for authenticated
    match /locationHistory/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && isAdmin();
      allow delete: if isAdmin();
    }
    
    // Metadata - restricted access
    match /_metadata/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Setup Instructions

### Step 1: Create Collections in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Create Database** (if not already created)
5. Choose: **Start in production mode**
6. For each collection below, create a sample document:

#### Create `issues` Collection
- Collection name: `issues`
- Add a test document with sample issue data

#### Create `notifications` Collection
- Collection name: `notifications`
- Add a test document with sample notification

#### Create `activeLocations` Collection
- Collection name: `activeLocations`
- Add a test document with sample location

#### Create `locationHistory` Collection
- Collection name: `locationHistory`
- Add a test document with sample history entry

#### Create `_metadata` Collection
- Collection name: `_metadata`
- Create sub-documents:
  - `connection` - with connection state
  - `syncStatus` - with sync info
  - `config` - with feature flags

### Step 2: Deploy Security Rules

1. In Firebase Console, go to **Firestore > Rules**
2. Replace default rules with the rules provided above
3. Click **Publish**

### Step 3: Create Indexes (Optional but Recommended)

In Firestore Console, create the following indexes:

**issues Collection**:
- Fields: `status` (Ascending), `priority` (Ascending), `reportedAt` (Descending)
- Fields: `category` (Ascending)

**notifications Collection**:
- Fields: `userId` (Ascending), `read` (Ascending), `createdAt` (Descending)

**locationHistory Collection**:
- Fields: `area` (Ascending), `timestamp` (Descending)
- Fields: `day` (Ascending), `hour` (Ascending), `area` (Ascending)

### Step 4: Verify Collections

Run this verification script in browser console:

```javascript
// Verify collections exist
const db = firebase.firestore();
const collections = ['issues', 'notifications', 'activeLocations', 'locationHistory', '_metadata'];

collections.forEach(async (collectionName) => {
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
  } catch (error) {
    console.warn(`⚠️ ${collectionName}: ${error.message}`);
  }
});
```

---

## Usage in Application

### Issues Collection
- Created by: `js/smart-campus-location-ui.js` (issue report form)
- Used by: `js/firebase-sync.js`, `js/smart-campus-map.js` (rendering markers)
- Real-time updates via: Firestore onSnapshot listeners

### Notifications Collection
- Created by: Backend Cloud Functions (issue updates)
- Used by: `js/firebase-notifications.js` (notification display)
- Consumed by: User notification panel

### ActiveLocations Collection
- Created by: `js/smart-campus-location-tracking.js` (sendLocationToFirebase)
- Used by: Heatmap analysis, real-time user tracking
- Updated every 10-30 seconds when location tracking enabled

### LocationHistory Collection
- Created by: `js/smart-campus-location-tracking.js` (sendLocationToFirebase)
- Used by: Heatmap generation, traffic analysis
- Queries performed: Aggregated by area, day, hour for analytics

### _metadata Collection
- Used by: Sync manager for connection state
- Purpose: System health monitoring and feature flags

---

## Backup & Recovery

### Export Collections

```bash
# Using Firebase CLI
firebase firestore:export ./backups/firestore-backup

# Via Cloud Functions (recommended for production)
# See BACKEND_EXPORT_API.js for template
```

### Import Collections

```bash
firebase firestore:import ./backups/firestore-backup
```

---

## Troubleshooting

### Collections Not Showing Data

1. Check **Security Rules** - ensure they allow reads
2. Verify **Firebase is initialized** - check console for errors
3. Confirm **network connectivity** - app should sync when online

### Slow Queries

1. **Create composite indexes** for frequently filtered queries
2. **Limit document reads** - use `.limit()` in queries
3. **Use pagination** - implement cursor-based pagination for large datasets

### Data Not Syncing

1. Check **Firebase authentication** - must be signed in
2. Verify **Firestore is enabled** in Firebase project
3. Review **browser console** for sync errors
4. Check **offline status** - data queues in `localStorage` when offline

---

## Best Practices

✅ **DO**:
- Use document IDs meaningfully (userId for activeLocations)
- Create composite indexes for complex queries
- Implement soft deletes (deleted flag) instead of hard deletes
- Use timestamps consistently for audit trails
- Keep documents under 1MB (Firestore limit)
- Archive old locationHistory periodically

❌ **DON'T**:
- Store large files directly in Firestore (use Cloud Storage)
- Create deeply nested documents (use sub-collections)
- Use unbounded queries (always add `.limit()`)
- Store sensitive data without encryption
- Make real-time subscriptions on large collections without filtering

---

## References

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
