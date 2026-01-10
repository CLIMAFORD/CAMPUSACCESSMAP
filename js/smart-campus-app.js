/**
 * Smart Campus Access Map - Main Application Module
 * Initializes and coordinates all modules
 */

const SmartCampusApp = (() => {
    const initialize = () => {
        console.log('Initializing Smart Campus Access Map...');

        // Check if required libraries are loaded
        if (!window.L) {
            console.error('Leaflet library not loaded');
            return;
        }

        if (!window.bootstrap) {
            console.error('Bootstrap library not loaded');
            return;
        }

        // Initialize modules in sequence
        setTimeout(() => {
            // 1. Map is initialized in MapManager
            console.log('✓ Map module initialized');

            // 2. Initialize UI
            UIManager.initializeEventListeners();
            console.log('✓ UI module initialized');

            // 3. Load and render issues
            IssuesManager.refreshIssuesList();
            console.log('✓ Issues module initialized');

            // 4. Update analytics
            AnalyticsManager.updateStatistics();
            console.log('✓ Analytics module initialized');

            // 5. Show welcome message
            NotificationManager.success('Smart Campus Access Map loaded successfully!');

            // Setup periodic updates
            setupPeriodicUpdates();
        }, 500);
    };

    const setupPeriodicUpdates = () => {
        // Update analytics every 5 minutes
        setInterval(() => {
            AnalyticsManager.updateStatistics();
        }, 5 * 60 * 1000);

        // Check for location changes every 30 seconds
        setInterval(() => {
            if (UIManager.getCurrentLocation()) {
                // Could trigger location-based features here
            }
        }, 30 * 1000);
    };

    const getAppState = () => {
        return {
            issues: StorageManager.getIssues(),
            analytics: StorageManager.getAnalytics(),
            preferences: StorageManager.getPreferences(),
            timestamp: new Date().toISOString()
        };
    };

    const logDebugInfo = () => {
        const state = getAppState();
        console.log('Smart Campus App State:', state);
        return state;
    };

    return {
        initialize,
        getAppState,
        logDebugInfo
    };
})();

// Initialize application when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SmartCampusApp.initialize);
} else {
    SmartCampusApp.initialize();
}

// Make app accessible globally for debugging
window.SmartCampusApp = SmartCampusApp;
window.StorageManager = StorageManager;
window.IssuesManager = IssuesManager;
window.MapManager = MapManager;
window.AnalyticsManager = AnalyticsManager;
window.UIManager = UIManager;
window.NotificationManager = NotificationManager;

// Log application version and status
console.log('Smart Campus Access Map v1.0');
console.log('For debugging, use: SmartCampusApp.logDebugInfo()');
