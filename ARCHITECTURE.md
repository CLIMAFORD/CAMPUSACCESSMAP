# Smart Campus Access Map - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Smart Campus UI Layer                      │
│  (HTML/CSS/Bootstrap 5 - Responsive across all devices)      │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────┐
│                  Application Modules Layer                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │     UI     │  │  Analytics │  │  Notifications   │      │
│  │  Manager   │  │  Manager   │  │   Manager        │      │
│  └────────────┘  └────────────┘  └──────────────────┘      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │   Issues   │  │     Map    │  │    Storage       │      │
│  │  Manager   │  │  Manager   │  │   Manager        │      │
│  └────────────┘  └────────────┘  └──────────────────┘      │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────┐
│                    Data & Integration Layer                  │
│  ┌────────────────────┐         ┌──────────────────┐        │
│  │  Browser Local     │◄────────┤  Leaflet.js      │        │
│  │  Storage API       │         │  Map Library     │        │
│  │  (JSON Data)       │         │  (Rendering)     │        │
│  └────────────────────┘         └──────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

## Module Responsibilities

### 1. StorageManager (`smart-campus-storage.js`)
**Purpose:** Persistent data management

**Key Methods:**
```javascript
// Issues
getIssues()                  // Fetch all issues
saveIssue(issue)            // Create or update
deleteIssue(id)             // Remove issue
getIssueById(id)            // Find specific issue
clearAllIssues()            // Bulk clear

// Preferences
getPreferences()            // User settings
setPreference(key, val)     // Save preference

// Analytics
getAnalytics()              // Get stats
updateAnalytics()           // Recalculate

// Import/Export
exportData()                // Download JSON
importData(data)            // Upload JSON
clearAllData()              // Nuclear option
```

**Data Schema:**
```javascript
{
  id: "issue_1234567890",
  type: "blocked-ramp|elevator-broken|...",
  location: "Building Name",
  description: "Detailed description",
  severity: "low|medium|high",
  status: "pending|in-progress|resolved",
  latitude: 0.123,
  longitude: 34.567,
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:00:00Z",
  reporter: "Name or Anonymous",
  statusNotes: "Update notes",
  attachments: [] // Future enhancement
}
```

### 2. MapManager (`smart-campus-map.js`)
**Purpose:** Map initialization and issue visualization

**Key Methods:**
```javascript
init()                          // Initialize map
addIssueMarker(issue)          // Add marker to map
removeIssueMarker(id)          // Remove marker
renderAllIssues()              // Render all markers
fitToIssue(issue)             // Pan & zoom to issue
fitToBounds(issues)           // Show multiple issues
getMapCenter()                 // Get center coordinates
getCurrentMapBounds()         // Get visible bounds
getSeverityColor(severity)    // Get color for severity
```

**Integration Points:**
- Uses global `window.mapInstance` (created by QGIS2web)
- Uses global `window.mapLayers` (created by QGIS2web)
- Creates feature group `issueLayer` for custom markers

**Marker Styling:**
- Low (green #28a745): Minor issues, can wait
- Medium (yellow #ffc107): Important, should be fixed soon  
- High (red #dc3545): Urgent, accessibility blocked

### 3. IssuesManager (`smart-campus-issues.js`)
**Purpose:** Business logic for issue operations

**Key Methods:**
```javascript
createIssue(formData)          // New issue
updateIssueStatus(id, status)  // Change status
deleteIssue(id)                // Remove issue
selectIssue(id)               // Prepare for viewing
showIssueDetails()            // Display modal
saveStatus(id)                // Save status changes
confirmDelete(id)             // Delete with confirmation
refreshIssuesList()           // Update UI list
```

**Workflow:**
1. User fills form → `handleReportSubmit()` in UIManager
2. UIManager calls `createIssue()`
3. IssuesManager validates and calls `StorageManager.saveIssue()`
4. IssuesManager calls `MapManager.addIssueMarker()`
5. IssuesManager calls `updateAnalytics()`
6. IssuesManager calls `refreshIssuesList()`
7. NotificationManager shows success message

### 4. UIManager (`smart-campus-ui.js`)
**Purpose:** Form handling and user interactions

**Key Methods:**
```javascript
initializeEventListeners()     // Setup all handlers
handleReportSubmit(e)          // Form submission
getCurrentPosition()           // Get GPS location
toggleLocationInput(e)         // Handle checkbox
updateIssueCount()            // Update badge
```

**Event Listeners:**
- `#reportForm` - submission
- `#useLocation` - checkbox changes
- `#refreshIssues` - refresh button
- `#fabReport` - mobile FAB button

**Global Functions:**
```javascript
switchTab(tabId)              // Navigate to tab
updateSidebar(tabId)          // Update & switch
exportData()                  // Download JSON
clearAllData()               // Clear everything
```

### 5. NotificationManager (`smart-campus-notifications.js`)
**Purpose:** User feedback messages

**Methods:**
```javascript
show(message, type, duration)  // Generic toast
success(message, duration)     // Green toast
error(message, duration)       // Red toast
warning(message, duration)     // Yellow toast
info(message, duration)        // Blue toast
```

**Toast Types:**
- success: #28a745 (green)
- danger: #dc3545 (red)
- warning: #ffc107 (yellow)
- info: #007bff (blue)

### 6. AnalyticsManager (`smart-campus-analytics.js`)
**Purpose:** Statistics and visualization

**Key Methods:**
```javascript
updateStatistics()            // Refresh all stats
updateCharts(analytics)       // Redraw charts
getIssueStats()              // Get key numbers
getAccessibilityScore()      // Calc score 0-100
getMostAffectedAreas(limit)  // Top problem areas
getReportTrend(days)         // Report frequency
```

**Calculated Metrics:**
- Total Reports: Count of all issues
- Resolved: Count where status = resolved
- Pending: Count where status = pending
- In Progress: Count where status = in-progress
- Accessibility Score: (resolved / total) * 100 - pending_penalty

### 7. SmartCampusApp (`smart-campus-app.js`)
**Purpose:** Application orchestration and initialization

**Key Methods:**
```javascript
initialize()                  // Initialize all modules
setupPeriodicUpdates()        // Setup intervals
getAppState()                 // Get current state
logDebugInfo()               // Debug helper
```

**Initialization Sequence:**
1. Check libraries loaded (Leaflet, Bootstrap)
2. Initialize map
3. Initialize UI
4. Load issues
5. Update analytics
6. Show welcome message
7. Setup periodic updates (5 min intervals)

## Data Flow Patterns

### Reporting a New Issue
```
User Input (Form)
    ↓
UIManager.handleReportSubmit()
    ↓
IssuesManager.createIssue()
    ↓
StorageManager.saveIssue()  [localStorage]
    ↓
MapManager.addIssueMarker()  [Render on map]
    ↓
AnalyticsManager.updateStatistics()  [Recalc]
    ↓
IssuesManager.refreshIssuesList()  [Update list]
    ↓
NotificationManager.success()  [Show toast]
```

### Updating Issue Status
```
User Selection (Modal)
    ↓
IssuesManager.saveStatus()
    ↓
StorageManager.updateIssueStatus()  [localStorage]
    ↓
MapManager.addIssueMarker()  [Update marker]
    ↓
AnalyticsManager.updateStatistics()  [Recalc]
    ↓
NotificationManager.success()
```

### Exporting Data
```
User Action (Menu)
    ↓
exportData()  [Global function]
    ↓
StorageManager.exportData()
    ↓
Create Blob & Download
    ↓
NotificationManager.success()
```

## Storage Structure

### localStorage Keys
```javascript
// Issues array
localStorage.getItem('scam_issues')
// [
//   {id, type, location, ...},
//   {id, type, location, ...}
// ]

// Preferences object
localStorage.getItem('scam_preferences')
// {
//   showResolvedIssues: false,
//   selectedSeverities: ['low', 'medium', 'high'],
//   mapZoom: 17,
//   lastLocation: null
// }

// Analytics object
localStorage.getItem('scam_analytics')
// {
//   totalReports: 42,
//   resolvedCount: 18,
//   byType: {blocked-ramp: 5, ...},
//   bySeverity: {low: 10, medium: 20, high: 12},
//   byStatus: {pending: 15, ...},
//   lastUpdated: "2024-01-01T..."
// }
```

### Storage Limits
- Chrome/Edge: 5-10MB
- Firefox: 10MB
- Safari: 5MB
- Mobile: Similar limits

## Extension Points

### Adding New Issue Type
1. Add option in `index.html` form
2. Charts automatically include it (dynamic)
3. No code changes needed

### Adding New Tab
1. Add HTML tab in `index.html`
2. Create new module for logic
3. Add initialization in `SmartCampusApp`
4. Add event listeners in `UIManager`

### Backend Integration
1. Create API endpoints (/api/issues)
2. Modify StorageManager methods to call fetch()
3. Keep local cache for offline support
4. Use service workers for sync

### Custom Styling
1. Modify `:root` variables in CSS
2. Add custom classes for new features
3. Use Bootstrap utility classes
4. Maintain responsive breakpoints

## Performance Considerations

### Optimization Tips
1. **Issue Rendering**: Limit visible markers with bounds checking
2. **Storage**: JSON.parse/stringify used only when needed
3. **DOM Updates**: Batch updates to avoid repaints
4. **Analytics**: Calculated on demand, cached

### Memory Management
- Issues stored in localStorage (not memory)
- Markers stored in mapLayer (cleaned on updates)
- Old modals removed before creating new ones
- Event listeners properly removed

### Scalability
- Tested with 500+ issues (localStorage limit reached first)
- Map performance good with <1000 markers
- For larger datasets, implement pagination or filtering

## Testing Approach

### Manual Testing Checklist
- [ ] Report issue on desktop
- [ ] Report issue on mobile (GPS required)
- [ ] Update issue status
- [ ] Delete issue
- [ ] View analytics
- [ ] Export data
- [ ] Import data
- [ ] Clear all data
- [ ] Responsive layout (desktop, tablet, mobile)
- [ ] Keyboard navigation (Tab, Enter, Escape)

### Debug Commands
```javascript
// In browser console
SmartCampusApp.logDebugInfo()        // Full state
StorageManager.getIssues()           // All issues
AnalyticsManager.getIssueStats()     // Stats
MapManager.map.getCenter()           // Map center
UIManager.getCurrentLocation()       // Last location
```

## Browser API Usage

### Used APIs
- **localStorage** - Persistent data storage
- **Geolocation API** - GPS coordinates
- **Fetch API** - Future backend calls
- **Date API** - Timestamps
- **JSON** - Serialization

### Permissions Required
- **Geolocation**: User must grant permission
- **Storage**: No special permission (localStorage is default)

## Future Architecture Changes

### Phase 2 Enhancements
1. Add backend API layer
2. Implement WebSocket for real-time sync
3. Add service worker for offline capability
4. Create admin dashboard module
5. Add image upload module
6. Implement caching strategy

### Phase 3 Scaling
1. Database for persistent storage
2. Authentication system
3. Role-based access control
4. Advanced filtering
5. Mobile app (React Native)
6. Email notifications

## Dependencies

### External Libraries
- **Leaflet 1.9+** - Map rendering
- **Bootstrap 5.3** - UI framework
- **Font Awesome 6.4** - Icons
- **QGIS2web** - Map data

### No External Dependencies For:
- Data management
- Issue handling
- Analytics
- Notifications
- Core UI logic

## Code Style

### Naming Conventions
- `camelCase` for variables and functions
- `PascalCase` for modules/objects
- `SCREAMING_SNAKE_CASE` for constants
- Descriptive names (no abbreviations)

### Module Pattern
```javascript
const ModuleName = (() => {
    // Private variables
    let private = null;
    
    // Private functions
    const privateFunc = () => {};
    
    // Public API
    return {
        publicMethod: () => {},
        get publicProp() { return private; }
    };
})();
```

## Security Considerations

### Current State
- No authentication (anyone can report/edit)
- No input validation (XSS possible)
- All data visible to all users

### Recommendations for Production
1. Implement input sanitization
2. Add user authentication
3. Validate data server-side
4. Use HTTPS
5. Rate limit API endpoints
6. Implement CSRF tokens

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**For:** Developers and System Administrators
