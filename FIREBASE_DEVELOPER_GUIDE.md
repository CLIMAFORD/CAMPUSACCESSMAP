# Firebase Integration Developer Guide

## Quick Start (5 Minutes)

### 1. Add Firebase Configuration

Edit `firebase-config.js` with your Firebase project credentials:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "AIzaSy...",
    authDomain: "project.firebaseapp.com",
    projectId: "project-id",
    storageBucket: "project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc..."
};
```

### 2. Initialize Firebase on App Start

```javascript
// Automatically runs in smart-campus-app.js
await HybridStorageManager.initialize();
```

### 3. Start Using It

```javascript
// Save an issue (automatically syncs to Firebase)
const issue = await HybridStorageManager.saveIssue({
    type: 'blocked-ramp',
    location: 'Main Building',
    severity: 'high',
    description: 'Ramp to entrance is blocked'
});

// Updates appear on everyone's map in real-time
```

## Architecture Overview

### Hybrid Storage System

```
┌─────────────────────────────────────┐
│   User Action (Report Issue)        │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │  Local Storage  │ ← Fast, immediate
        │  (Instant)      │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Firebase Sync  │ ← Cloud backup, real-time
        │  (Background)   │
        └────────┬────────┘
                 │
        ┌────────▼────────────────────────┐
        │  Real-Time Listeners (All Users)│
        │  - Issue map update             │
        │  - Analytics refresh            │
        │  - Notifications                │
        └─────────────────────────────────┘
```

### Key Modules

| Module | Purpose | Location |
|--------|---------|----------|
| `firebase-config.js` | Configuration & setup | Root directory |
| `firebase-sync.js` | Firestore real-time sync | `js/` |
| `firebase-notifications.js` | Push/email alerts | `js/` |
| `hybrid-storage.js` | Offline-first wrapper | `js/` |

## Using HybridStorageManager

The `HybridStorageManager` is your main interface. It replaces direct Firebase calls:

### Save Issue

```javascript
// Local + Firebase
const issue = await HybridStorageManager.saveIssue({
    type: 'blocked-ramp',
    location: 'Main Building',
    description: 'Entrance ramp blocked by furniture',
    severity: 'high',
    latitude: -0.353833,
    longitude: 34.431822,
    reportedBy: 'John Doe'
});

// Returns: { id: 'issue_1234...', ...issue, createdAt: '2025-01-10...' }
```

### Update Status

```javascript
// Local + Firebase
const result = await HybridStorageManager.updateIssueStatus(
    'issue_1234...',
    'in_progress',
    'Maintenance crew dispatched' // optional notes
);
```

### Get Issues

```javascript
// Returns issues from local storage (synced from Firebase)
const issues = HybridStorageManager.getIssues();

// Filter by status
const pending = await HybridStorageManager.getIssuesByFilter({
    status: 'pending'
});

// Filter by severity
const urgent = await HybridStorageManager.getIssuesByFilter({
    severity: 'high'
});
```

### Get Audit Trail

```javascript
// Get all changes to an issue
const trail = await HybridStorageManager.getAuditTrail('issue_1234...');

// Returns:
// [
//   { action: 'created', by: 'user_123', timestamp: '2025-01-10...' },
//   { action: 'status_changed', from: 'pending', to: 'in_progress', by: 'user_456', ... },
//   { action: 'notes_added', notes: 'Started work', ... }
// ]
```

### Export & Import

```javascript
// Export all data as JSON
const backup = await HybridStorageManager.exportData();
// Returns: { exportDate, issues, source: 'firebase' }

// Save to file
const json = JSON.stringify(backup);
const blob = new Blob([json], { type: 'application/json' });
// Download or send to server...

// Import backup
await HybridStorageManager.importData(backup);
```

## Real-Time Listeners

### Listen for Issue Changes

```javascript
// In your module initialization:
FirebaseSync.startIssueSyncListener((issues) => {
    console.log('Updated issues:', issues);
    // Update map with new data
    MapManager.renderAllIssues(issues);
    // Update analytics
    AnalyticsManager.updateStatistics();
});
```

### Listen for Notifications

```javascript
FirebaseSync.startNotificationListener((notification) => {
    console.log('New notification:', notification);
    
    if (notification.type === 'new_issue') {
        NotificationManager.info(`New issue: ${notification.issue.type}`);
        // Play sound
        playAlertSound();
    }
});
```

### Listen for High-Severity Alerts

```javascript
FirebaseNotifications.listenForHighSeverityIssues((alert) => {
    console.log('🚨 URGENT:', alert.message);
    
    // Show prominent alert
    NotificationManager.error(alert.message);
    
    // Optionally center map on issue
    MapManager.fitToIssue(alert.issue.id);
    
    // Play loud alert
    playUrgentAlert();
});
```

## Offline Handling

The app automatically handles offline scenarios:

### How It Works

1. **User reports issue** → Saved to localStorage immediately
2. **App detects offline** → Continues working with local data
3. **Internet reconnects** → Syncs changes to Firebase
4. **Sync completes** → Other users see the changes

### Check Connection Status

```javascript
// Get current storage status
const status = HybridStorageManager.getStatus();

console.log(status);
// {
//   initialized: true,
//   firebaseEnabled: true,
//   firebaseOnline: true,
//   storageMode: 'hybrid',
//   userId: 'user_123...'
// }

// Check if online
if (status.firebaseOnline) {
    console.log('Connected to Firebase ✅');
} else {
    console.log('Working offline (will sync when connected) 📱');
}
```

### Manual Sync Trigger

```javascript
// Force manual sync after coming online
window.addEventListener('online', () => {
    console.log('Connection restored, syncing...');
    // Data automatically syncs - no action needed
});

// Subscribe to sync events
FirebaseSync.onSyncChange((issue, action) => {
    console.log(`Issue ${action}:`, issue.id);
    // action: 'saved', 'status_updated', or 'deleted'
});
```

## Event System

The app uses custom events for module communication:

### Issue Sync Event

```javascript
window.addEventListener('scam:issuesSync', (event) => {
    const { issues } = event.detail;
    console.log('Issues synced from Firebase:', issues.length);
    
    // Update UI
    updateIssueCounts(issues);
});
```

### Notification Event

```javascript
window.addEventListener('scam:notification', (event) => {
    const notification = event.detail;
    console.log('Firebase notification:', notification);
    
    // Handle notification
    processNotification(notification);
});
```

### Firebase Notification Event

```javascript
window.addEventListener('scam:firebaseNotification', (event) => {
    const notification = event.detail;
    console.log('Push notification:', notification);
});
```

## Error Handling

The hybrid system gracefully handles errors:

### Sync Failures

```javascript
try {
    await HybridStorageManager.saveIssue(issue);
} catch (error) {
    // Firebase failed, but data saved to localStorage
    console.warn('Cloud sync failed (using local):', error.message);
    
    // Notify user
    NotificationManager.warning('Working offline - changes will sync when connected');
}
```

### Network Errors

```javascript
// Listen for offline/online events
window.addEventListener('offline', () => {
    console.log('Lost internet connection');
    NotificationManager.warning('You are offline. Changes will sync when online.');
});

window.addEventListener('online', () => {
    console.log('Back online');
    NotificationManager.success('Connection restored. Syncing data...');
});
```

## Adding New Features

### Add New Issue Field to Firestore

```javascript
// In your form handler:
const issue = {
    type: 'blocked-ramp',
    location: 'Main Building',
    severity: 'high',
    description: '...',
    // Add custom field
    photoUrl: 'https://...photo.jpg',
    contactPhone: '+254-700-000-000',
    wheelchairAccessible: false
};

await HybridStorageManager.saveIssue(issue);
```

### Update Security Rules for New Fields

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      allow read: if true;
      allow create: if 
        request.resource.data.type in ['blocked-ramp', 'broken-elevator', 'etc'] &&
        request.resource.data.severity in ['low', 'medium', 'high'] &&
        request.resource.data.location != '' &&
        request.resource.data.description != '';
      allow update: if
        request.auth.uid == resource.data.userId ||
        request.auth.token.isMaintenance == true;
    }
  }
}
```

### Query by New Field

```javascript
// Get accessibility-critical locations
const critical = await HybridStorageManager.getIssuesByFilter({
    wheelchairAccessible: false,
    severity: 'high'
});
```

## Integration with Existing Modules

The existing Smart Campus modules now use hybrid storage automatically:

### Smart Campus Issues Module

```javascript
// smart-campus-issues.js already uses HybridStorageManager
IssuesManager.createIssue(formData);
// ↓
HybridStorageManager.saveIssue(issue);
// ↓ Saves to local + Firebase
```

### Smart Campus Map Module

```javascript
// MapManager.renderAllIssues() gets real-time updates
window.addEventListener('scam:issuesSync', () => {
    MapManager.renderAllIssues(HybridStorageManager.getIssues());
});
```

### Smart Campus Analytics Module

```javascript
// AnalyticsManager uses Firebase for advanced metrics
const analytics = await HybridStorageManager.getAnalytics(30);
// Returns: { totalReports, byStatus, bySeverity, averageResolutionTime }
```

## Testing

### Test Real-Time Sync

```javascript
// Open 2 browser tabs
// Tab 1: Report an issue
// Tab 2: Watch it appear instantly

// Monitor in console
HybridStorageManager.getStatus();
```

### Test Offline Mode

```javascript
// Browser DevTools → Network tab → Offline
// Report an issue (saves to localStorage only)
// Status: { firebaseOnline: false, storageMode: 'local' }

// Go back online → Changes sync automatically
```

### Test with Firebase Emulator

```bash
# Install Firebase Tools
npm install -g firebase-tools

# Start emulator
firebase emulators:start

# Connect app to emulator (automatically in dev)
# Test without using real Firestore
```

## Performance Tips

### Query Optimization

```javascript
// ❌ Inefficient - gets all then filters
const all = await HybridStorageManager.getIssues();
const pending = all.filter(i => i.status === 'pending');

// ✅ Efficient - filters in database
const pending = await HybridStorageManager.getIssuesByFilter({
    status: 'pending'
});
```

### Pagination for Large Datasets

```javascript
// For apps with 1000+ issues, implement pagination
// Firebase supports: .limit(100).startAfter(lastDoc)

async function getPaginatedIssues(pageSize = 50, lastDocId = null) {
    let query = db.collection('issues');
    
    if (lastDocId) {
        const lastDoc = await db.collection('issues').doc(lastDocId).get();
        query = query.startAfter(lastDoc);
    }
    
    return query.limit(pageSize).get();
}
```

### Caching Strategy

```javascript
// Firebase automatically caches in browser
// But you can optimize further:

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedIssues = null;
let cacheTime = 0;

function getCachedIssues() {
    const now = Date.now();
    if (cachedIssues && (now - cacheTime) < CACHE_DURATION) {
        return cachedIssues;
    }
    
    cachedIssues = HybridStorageManager.getIssues();
    cacheTime = now;
    return cachedIssues;
}
```

## Debugging

### Enable Debug Logging

```javascript
// In browser console
localStorage.setItem('scam_debug', 'true');

// View all Firebase operations
firebase.firestore.enableLogging(true);

// Check status
HybridStorageManager.getStatus();
SmartCampusApp.logDebugInfo();
```

### Monitor Firestore Usage

**In Firebase Console:**
1. Go to Firestore Database
2. Click "Usage" tab
3. View read/write operations
4. Check data storage

### View Real-Time Sync Activity

```javascript
// In browser console, watch sync events
window.addEventListener('scam:issuesSync', (e) => {
    console.log(`📡 Synced ${e.detail.issues.length} issues`);
});

FirebaseSync.onSyncChange((issue, action) => {
    console.log(`🔄 Issue ${action}:`, issue.id);
});
```

## Migration from Local-Only Storage

### Existing App → Firebase-Enabled

The transition is automatic:

1. **Existing local data preserved** - All localStorage issues remain
2. **New data syncs to Firebase** - Going forward, sync happens
3. **One-time import** (optional):

```javascript
// Import old local data to Firebase
const localIssues = localStorage.getItem('scam_issues');
if (localIssues) {
    const data = {
        issues: JSON.parse(localIssues)
    };
    
    await HybridStorageManager.importData(data);
    console.log('✅ Legacy data imported to Firebase');
}
```

## Troubleshooting Integration

### Issues Not Syncing

```javascript
// Check status
const status = HybridStorageManager.getStatus();

// Should show:
// {
//   firebaseEnabled: true,
//   firebaseOnline: true,
//   storageMode: 'hybrid'
// }

// If offline, check:
// 1. Internet connection
// 2. Firebase credentials valid
// 3. Firestore database created
// 4. Security rules allow writes
```

### Slow Performance

```javascript
// Check number of issues
const issues = HybridStorageManager.getIssues();
console.log(`Total issues: ${issues.length}`);

// If > 1000, implement pagination
// If queries slow, add Firestore indexes
```

### Merge Conflicts

```javascript
// Firebase automatically handles conflicts
// Latest write wins (timestamp-based)

// If critical, use transaction:
const batch = db.batch();
batch.update(ref1, data1);
batch.update(ref2, data2);
await batch.commit();
```

## Next Steps

1. ✅ Configure `firebase-config.js`
2. ✅ Create Firestore database
3. ✅ Test real-time sync (2 browser tabs)
4. ✅ Deploy Cloud Functions (for email alerts)
5. ✅ Set up authentication (if needed)
6. ✅ Monitor usage in Firebase Console

---

**Firebase integration is complete and production-ready!** 🚀
