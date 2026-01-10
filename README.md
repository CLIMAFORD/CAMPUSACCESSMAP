# Smart Campus Access Map

A professional, responsive web application for reporting and tracking accessibility issues on university campuses. Built with Leaflet.js, Bootstrap 5, and a modular JavaScript architecture.

## Features

### 📱 Responsive Design
- **Mobile-first approach** - Works perfectly on smartphones, tablets, and desktops
- **Adaptive UI** - Sidebar converts to offcanvas menu on mobile devices
- **Touch-friendly** - Large buttons and controls for easy mobile interaction
- **Orientation support** - Maintains functionality in portrait and landscape

### 🚩 Issue Reporting
- **Easy reporting form** - Simple interface to report accessibility issues
- **Rich categorization** - Issue types (blocked ramps, elevator outages, damaged paths, etc.)
- **Severity levels** - Low, Medium, High priority classification
- **Location capture** - Automatic GPS detection or manual entry
- **Detailed descriptions** - Capture full context of issues

### 📍 Real-Time Map Integration
- **Interactive mapping** - Click map to view campus layers and reported issues
- **Issue visualization** - Color-coded markers (green=low, yellow=medium, red=high)
- **Layer control** - Toggle visibility of roads, buildings, forests, and campus areas
- **Zoom to issue** - Click issues to focus map on their location
- **Integrated search** - Find locations using Nominatim OSM

### 🔄 Issue Tracking
- **Status management** - Pending, In Progress, Resolved states
- **Status updates** - Add notes when updating issue status
- **Issue history** - Track creation date, updates, and resolution time
- **Quick actions** - View, update, resolve, or delete issues
- **Active counter** - Badge showing number of unresolved issues

### 📊 Analytics Dashboard
- **Statistics panel** - Total reports, resolved count, pending issues
- **Visual charts** - Issues by type, severity, and status
- **Accessibility score** - Overall campus accessibility rating
- **Trend analysis** - Monitor reporting patterns over time
- **Affected areas** - Identify problem hotspots on campus

### 💾 Data Management
- **Local storage** - All data persists in browser (no server needed for basic use)
- **Export/Import** - Download data as JSON for backup or analysis
- **Data clearing** - Clear all data with confirmation protection
- **Analytics persistence** - Historical data for trending and analysis

### 🔔 Notifications
- **Toast alerts** - Non-intrusive success, warning, and error messages
- **Real-time feedback** - Instant confirmation of user actions
- **Multiple types** - Success, error, warning, and info notifications

## Architecture

### Module-Based Organization

```
js/
├── smart-campus-storage.js      # Local storage management
├── smart-campus-map.js          # Map initialization and markers
├── smart-campus-issues.js       # Issue CRUD operations
├── smart-campus-notifications.js # Toast notifications
├── smart-campus-analytics.js    # Statistics and charts
├── smart-campus-ui.js           # Form handling and UI interactions
└── smart-campus-app.js          # Main application coordinator
```

Each module is self-contained and communicates through well-defined interfaces, making the code:
- **Maintainable** - Easy to locate and modify features
- **Scalable** - Simple to add new modules without affecting existing code
- **Testable** - Each module can be tested independently
- **Reusable** - Modules can be used in other projects

### Data Flow

```
User Action
    ↓
UI Module (smart-campus-ui.js)
    ↓
IssuesManager (smart-campus-issues.js)
    ↓
StorageManager (smart-campus-storage.js) + MapManager (smart-campus-map.js)
    ↓
AnalyticsManager (smart-campus-analytics.js)
    ↓
Notifications (smart-campus-notifications.js)
```

## Usage

### Basic Navigation

1. **Map Tab** - View campus map with issue markers
2. **Report Tab** - Submit new accessibility issues
3. **Issues Tab** - View, update, and manage all reported issues
4. **Analytics Tab** - View statistics and trends

### Reporting an Issue

1. Click the "Report Issue" tab (or FAB button on mobile)
2. Select issue type from dropdown
3. Enter location (building name or area)
4. Describe the issue in detail
5. Choose severity level (Low/Medium/High)
6. Check "Use current location" to auto-capture GPS data
7. Click "Submit Report"

### Managing Issues

1. Go to "Active Issues" tab
2. Click "View" button to see full details
3. Click "Update" button to change status
4. Add status notes explaining the update
5. Choose new status (Pending/In Progress/Resolved)
6. Click "Update Status" to save

### Viewing Analytics

1. Open "Analytics" tab
2. View key metrics at top (Total Reports, Resolved, Pending)
3. Scroll down to see charts by:
   - **Type** - Most reported issue categories
   - **Severity** - Distribution of severity levels
   - **Status** - Current state of all issues

## Responsive Breakpoints

### Desktop (1025px+)
- Sidebar right always visible
- Full map view with sidebar
- All features fully accessible

### Tablet (769px - 1024px)
- Sliding sidebar panel
- Hamburger menu for navigation
- Optimized touch interactions

### Mobile (< 768px)
- Full-screen offcanvas menu
- Bottom floating action button
- Compact form layouts
- Stack cards vertically

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Keyboard Navigation

- `Tab` - Navigate through form elements
- `Enter` - Submit forms or activate buttons
- `Escape` - Close modals and panels

## Accessibility Features

- ARIA labels for screen readers
- Focus indicators for keyboard navigation
- High contrast color schemes
- Semantic HTML structure
- Alt text for icons

## Storage Information

### Local Storage Keys
- `scam_issues` - All reported issues (JSON array)
- `scam_preferences` - User preferences (JSON object)
- `scam_analytics` - Analytics data (JSON object)

**Storage Limit:** Typically 5-10MB per domain (varies by browser)

### Data Structure Example

```javascript
{
  "id": "issue_1704067200000",
  "type": "blocked-ramp",
  "location": "Main Building Entrance",
  "description": "Ramp to main entrance blocked by construction materials",
  "severity": "high",
  "status": "pending",
  "latitude": 0.0015,
  "longitude": 34.6,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z",
  "reporter": "Anonymous"
}
```

## Installation & Setup

### Requirements
- Modern web browser with JavaScript enabled
- Local or web server to serve files (QGIS2web exports)
- No backend server required for basic functionality

### Steps
1. Extract the Smart Campus map files to your web server
2. Ensure all CSS and JS files are in correct directories
3. Open `index.html` in a web browser
4. Start reporting issues!

### Optional Backend Integration

To add backend persistence:

1. Create API endpoints for:
   - POST `/api/issues` - Create issue
   - GET `/api/issues` - Fetch issues
   - PATCH `/api/issues/:id` - Update issue
   - DELETE `/api/issues/:id` - Delete issue

2. Modify `IssuesManager` in `smart-campus-issues.js` to call API instead of local storage

3. Example integration:
```javascript
// In smart-campus-issues.js
const createIssue = (formData) => {
    return fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    }).then(r => r.json());
};
```

## Customization

### Issue Types
Edit the issue type dropdown in `index.html`:
```html
<select id="issueType">
    <option value="custom-type">My Custom Type</option>
</select>
```

### Colors and Branding
Modify CSS variables in `css/smart-campus.css`:
```css
:root {
    --primary-color: #007bff;
    --danger-color: #dc3545;
    --success-color: #28a745;
}
```

### Map Layers
All QGIS2web layers are automatically integrated. Control visibility in the "Map Layers" tab.

## Troubleshooting

### Map Not Loading
- Check browser console for JavaScript errors
- Verify all QGIS2web data files (`.js` in `/data`) are present
- Ensure Leaflet library is loaded

### Geolocation Not Working
- Check HTTPS (required for geolocation, except localhost)
- Grant location permission in browser
- Check browser geolocation settings

### Issues Not Appearing on Map
- Verify location has latitude/longitude
- Check "Use current location" checkbox
- Ensure map center is close to issue location
- Zoom out to see distant markers

### Storage Issues
- Clear browser cache and try again
- Check browser storage quota
- Use export/import to backup data

## Performance Tips

1. **Regular cleanup** - Archive resolved issues periodically
2. **Data export** - Export analytics data before clearing
3. **Browser cache** - Enable caching for static assets
4. **Map zoom** - Use appropriate zoom levels for better performance

## Future Enhancements

- [ ] Backend API integration for multi-user sync
- [ ] Image uploads with issues
- [ ] Email notifications for status updates
- [ ] Role-based access (students, staff, maintenance)
- [ ] Automated alerts for high-severity issues
- [ ] Mobile app (React Native/Flutter)
- [ ] Real-time collaboration
- [ ] Advanced filtering and search
- [ ] Integration with maintenance systems
- [ ] Custom report templates

## Support & Feedback

For issues, feature requests, or customization needs:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Export debug info: `SmartCampusApp.logDebugInfo()`

## License

This project is provided as-is for educational and institutional use.

## Credits

- Built with [Leaflet.js](https://leafletjs.com/) - Interactive Maps
- Styled with [Bootstrap 5](https://getbootstrap.com/) - Responsive Framework
- Icons by [Font Awesome](https://fontawesome.com/)
- Map data from [OpenStreetMap](https://www.openstreetmap.org/)
- QGIS data export via [QGIS2web](https://github.com/tomchadwin/qgis2web)

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready
