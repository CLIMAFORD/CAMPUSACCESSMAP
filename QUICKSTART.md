# Smart Campus Access Map - Quick Start Guide

## What's New?

Your QGIS2web map has been transformed into a professional Smart Campus Access application with the following additions:

### ✅ What Was Fixed

1. **Fixed Responsiveness** - Map now adapts to any screen size (mobile, tablet, desktop)
2. **Added Professional UI** - Modern interface with intuitive navigation
3. **Built Issue Reporting** - Students and staff can report accessibility problems
4. **Real-Time Tracking** - Issues get status updates (pending → in-progress → resolved)
5. **Analytics Dashboard** - Visualize patterns and campus accessibility metrics
6. **Offline Support** - All data stored locally in browser, no internet required to view

## Quick Navigation Guide

### 📍 Map Tab
- **View all campus layers** - Roads, buildings, forests, areas
- **See reported issues** - Color-coded markers show accessibility problems
- **Click issues** - View details and zoom to location
- **Toggle layers** - Show/hide specific campus features

### 🚩 Report Tab
- **Issue Type** - Select what kind of problem (blocked ramp, broken elevator, etc.)
- **Location** - Building name or campus area
- **Description** - Detailed explanation of the issue
- **Severity** - How urgent (Low/Medium/High)
- **Auto-Location** - Check box to use your GPS location
- **Submit** - Report goes live instantly on map

### 📋 Issues Tab
- **Active Issues List** - All reported problems
- **Color-coded cards** - Red = High severity, Yellow = Medium, Green = Low
- **Status badges** - Shows if pending, in-progress, or resolved
- **Quick actions** - View full details or update status
- **Refresh button** - Pull latest issues

### 📊 Analytics Tab
- **Key Metrics** - Total reports, resolved count, pending issues
- **Charts** - See which problems happen most frequently
- **Type breakdown** - Most common issue categories
- **Severity distribution** - How urgent reported problems are
- **Status overview** - What percentage are resolved

## Common Tasks

### Report a Blocked Ramp
1. Go to **Report Issue** tab
2. Select "Blocked Ramp" from dropdown
3. Enter location (e.g., "Main Building Entrance")
4. Describe: "Ramp blocked by construction materials"
5. Set severity to "High"
6. Check "Use current location"
7. Click "Submit Report"
8. Marker appears on map instantly ✓

### Update Issue Status
1. Go to **Active Issues** tab
2. Click "Update" button on an issue
3. Select new status in modal
4. Add notes (optional): "Maintenance crew notified"
5. Click "Update Status"
6. Status changes immediately ✓

### Find Most Problematic Areas
1. Go to **Analytics** tab
2. Look at "Issues by Type" chart
3. Sort mentally by location mentioned in issues
4. Could also export data and analyze in Excel

### Share Your Data
1. Click hamburger menu (mobile) or offcanvas button
2. Select "Export Data"
3. JSON file downloads
4. Email or share with campus administration
5. They can import it back using import function

## For Campus Administrators

### Setting Up for Student Use
1. Host on university web server
2. Send link to students/staff
3. No login required - anyone can report
4. Data stored locally on each user's browser
5. Periodically ask staff to export and send you data

### Tracking Campus Accessibility
- **Weekly check**: View Analytics tab to track trends
- **Monthly review**: Export data and create accessibility report
- **Prioritize fixes**: Use the severity/type charts to guide maintenance
- **Measure impact**: Resolved vs Pending ratio shows progress

### Maintenance Team Integration
- Get exported JSON from students
- Import into your copy to see all issues
- Update status as work progresses
- Export updated data back to students

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between form fields |
| `Enter` | Submit forms |
| `Esc` | Close modals |

## Mobile Tips

- **FAB Button** - The "+" button in bottom-right quickly opens report form
- **Menu** - Hamburger button (≡) at top-left opens navigation
- **Swipe** - Scroll tabs horizontally to see other sections
- **Pinch** - Zoom map by pinching with two fingers
- **Rotate** - Map adjusts for landscape or portrait

## Troubleshooting

### Map Doesn't Show
- **Check 1**: Is Leaflet working? Open browser console (F12)
- **Check 2**: Are you on a supported browser? (Chrome, Firefox, Safari)
- **Check 3**: Are all files in correct folders?

### Geolocation Doesn't Work
- **Check 1**: Are you on HTTPS or localhost? (Geolocation requires these)
- **Check 2**: Did you grant permission? Check browser address bar
- **Check 3**: Do you have GPS enabled on mobile?

### Issues Don't Save
- **Check 1**: Is local storage enabled in browser?
- **Check 2**: Try refreshing page - does data still appear?
- **Check 3**: Check browser storage limit (usually 5-10MB)

### Nothing Loads
- **Check 1**: Open browser console (F12) - any red errors?
- **Check 2**: Are you running from a web server (not file:// in address bar)?
- **Check 3**: Try different browser?

## Data Privacy

- **All data is local** - Stored only on your device's browser
- **No server uploads** - No cloud storage by default
- **You control sharing** - Only export when you choose to
- **Clearing data** - Click hamburger menu → "Clear Data" to permanently delete

## Advanced Features (For Developers)

### Access App State in Console
```javascript
// View all issues
SmartCampusApp.logDebugInfo()

// Get current analytics
AnalyticsManager.getIssueStats()

// Get most affected areas
AnalyticsManager.getMostAffectedAreas(5)

// Get 7-day trend
AnalyticsManager.getReportTrend(7)
```

### Customize Issue Types
Edit `index.html` and add your custom types:
```html
<option value="wifi-dead">Dead WiFi Zone</option>
<option value="lighting">Poor Lighting</option>
```

### Change Colors
Edit `css/smart-campus.css` root variables:
```css
:root {
    --primary-color: #YOUR_COLOR;
    --danger-color: #RED_COLOR;
}
```

## File Structure

```
Smart Campus Access New/
├── index.html                  # Main page
├── README.md                   # Full documentation
├── QUICKSTART.md              # This file
│
├── css/
│   ├── smart-campus.css       # NEW: Responsive styles
│   ├── leaflet.css            # Map styles (original)
│   └── ... other QGIS styles
│
├── js/
│   ├── smart-campus-storage.js    # NEW: Data persistence
│   ├── smart-campus-map.js        # NEW: Map management
│   ├── smart-campus-issues.js     # NEW: Issue CRUD
│   ├── smart-campus-notifications.js # NEW: Notifications
│   ├── smart-campus-analytics.js  # NEW: Statistics
│   ├── smart-campus-ui.js        # NEW: Form handling
│   ├── smart-campus-app.js       # NEW: Coordinator
│   ├── leaflet.js             # Map library (original)
│   └── ... other QGIS libraries
│
├── data/
│   ├── MasenoTown_1.js        # QGIS layers (original)
│   ├── Forest_2.js
│   ├── MasenoRoads_12.js
│   └── ... other layers
│
└── images/, legend/, markers/  # Original QGIS assets
```

## Getting Help

### In the App
- **Hover over icons** - Tooltips explain what buttons do
- **Form labels** - Show which fields are required (red *)
- **Toast messages** - Green = Success, Red = Error, Yellow = Warning

### Keyboard Help
- Most web apps use Tab to navigate, Enter to submit
- Escape closes popups
- Try your browser's accessibility features (usually in Settings)

## What's Saved

Your map now saves:
1. ✅ Every issue reported (location, type, description, severity)
2. ✅ Status history (when reported, when resolved)
3. ✅ Your preferences (selected filters, zoom level)
4. ✅ Statistics (for analytics dashboard)

Everything is saved automatically - no "Save" button needed!

## Next Steps

1. **Get familiar** - Explore all tabs and try reporting a test issue
2. **Invite users** - Share the map link with students and staff
3. **Monitor** - Check Analytics tab regularly
4. **Export data** - Periodically download for analysis
5. **Take action** - Use insights to improve campus accessibility

---

**Version:** 1.0 | **Created:** January 2026 | **Status:** Ready for Use

For full documentation, see README.md
