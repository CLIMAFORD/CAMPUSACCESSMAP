/**
 * Smart Campus Access Map - Location & Directions UI Handler
 * Manages UI interactions for directions, routing, and traffic visualization
 */

const LocationUI = (() => {
    let currentUserLocation = null;
    let isTrackingLocation = false;

    /**
     * Initialize location and directions UI
     */
    function initialize() {
        setupEventListeners();
        initializeLocationTracking();
        initializeTrafficVisualization();
        console.log('✅ Location UI initialized');
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Initialize campus locations
        Directions.initializeCampusLocations();

        // Location Tracking Toggle
        const trackingToggle = document.getElementById('enableLocationTracking');
        if (trackingToggle) {
            trackingToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    startLocationTracking();
                } else {
                    stopLocationTracking();
                }
            });
        }

        // My Location Button
        const myLocationBtn = document.getElementById('btnMyLocation');
        if (myLocationBtn) {
            myLocationBtn.addEventListener('click', useMyLocation);
        }

        // From Location Search
        const fromInput = document.getElementById('fromLocation');
        if (fromInput) {
            fromInput.addEventListener('input', (e) => handleLocationSearch(e.target.value, 'from'));
            fromInput.addEventListener('focus', (e) => showLocationSuggestions('from'));
            fromInput.addEventListener('blur', () => setTimeout(() => hideLocationDropdown('from'), 200));
        }

        // To Location Search
        const toInput = document.getElementById('toLocation');
        if (toInput) {
            toInput.addEventListener('input', (e) => handleLocationSearch(e.target.value, 'to'));
            toInput.addEventListener('focus', (e) => showLocationSuggestions('to'));
            toInput.addEventListener('blur', () => setTimeout(() => hideLocationDropdown('to'), 200));
        }

        // Browse Destination Button
        const browseBtn = document.getElementById('btnBrowseDestination');
        if (browseBtn) {
            browseBtn.addEventListener('click', () => showAllLocations());
        }

        // Get Directions Button
        const directionsBtn = document.getElementById('btnGetDirections');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', getDirections);
        }

        // Heatmap Toggle
        const heatmapToggle = document.getElementById('toggleHeatmap');
        if (heatmapToggle) {
            heatmapToggle.addEventListener('change', (e) => {
                HeatmapAnalytics.toggleHeatmap(window.mapInstance, e.target.checked);
            });
        }

        // Crowd Density Toggle
        const crowdToggle = document.getElementById('toggleCrowdDensity');
        if (crowdToggle) {
            crowdToggle.addEventListener('change', (e) => {
                HeatmapAnalytics.toggleCrowdDensity(window.mapInstance, e.target.checked);
            });
        }

        // Refresh Traffic Button
        const refreshBtn = document.getElementById('btnRefreshTraffic');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshTrafficData);
        }
    }

    /**
     * Initialize location tracking
     */
    function initializeLocationTracking() {
        // Subscribe to location changes
        LocationTracking.subscribe((location) => {
            currentUserLocation = location;
            updateLocationDisplay(location);
        });

        // Set initial location if available
        const initial = LocationTracking.getCurrentLocation();
        if (initial) {
            currentUserLocation = initial;
            updateLocationDisplay(initial);
        }
    }

    /**
     * Start location tracking
     */
    function startLocationTracking() {
        if (isTrackingLocation) return;

        const result = LocationTracking.startTracking(30000); // 30 second intervals
        if (result) {
            isTrackingLocation = true;
            console.log('📍 Location tracking started');
            SmartCampusNotifications.show(
                'Location tracking enabled',
                'Your location is being shared to help analyze campus traffic patterns.',
                'info'
            );
        } else {
            document.getElementById('enableLocationTracking').checked = false;
            SmartCampusNotifications.show(
                'Location access denied',
                'Please enable location access in your browser settings.',
                'error'
            );
        }
    }

    /**
     * Stop location tracking
     */
    function stopLocationTracking() {
        if (!isTrackingLocation) return;

        LocationTracking.stopTracking();
        isTrackingLocation = false;
        console.log('🛑 Location tracking stopped');
    }

    /**
     * Update location display in UI
     */
    function updateLocationDisplay(location) {
        const fromInput = document.getElementById('fromLocation');
        if (fromInput && location) {
            fromInput.value = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        }
    }

    /**
     * Use my current location as starting point
     */
    async function useMyLocation() {
        if (!currentUserLocation) {
            SmartCampusNotifications.show(
                'Location not available',
                'Please enable location tracking first.',
                'warning'
            );
            return;
        }

        updateLocationDisplay(currentUserLocation);
        SmartCampusNotifications.show(
            'Location set',
            `Start: ${currentUserLocation.latitude.toFixed(4)}, ${currentUserLocation.longitude.toFixed(4)}`,
            'success'
        );
    }

    /**
     * Get directions between two locations using Google Maps API
     * Supports place name search and converts to coordinates automatically
     */
    async function getDirections() {
        const fromInput = document.getElementById('fromLocation').value.trim();
        const toInput = document.getElementById('toLocation').value.trim();
        const transportMode = document.querySelector('input[name="transportMode"]:checked')?.value || 'walking';
        const wheelchairAccessible = document.getElementById('wheelchairAccessible').checked;
        const avoidCrowded = document.getElementById('avoidCrowded').checked;

        if (!fromInput || !toInput) {
            NotificationManager.warning('Please enter both starting point and destination.');
            return;
        }

        try {
            NotificationManager.warning('Calculating route...');
            
            // Get directions using Google Maps API (with fallback)
            let directionsData;
            try {
                directionsData = await GoogleDirections.getDirections(
                    fromInput,  // Can be place name or coordinates
                    toInput,    // Can be place name or coordinates
                    { 
                        mode: transportMode,  // walking, driving, transit, bicycling
                        wheelchair: wheelchairAccessible,
                        avoidCrowded: avoidCrowded
                    }
                );
            } catch (apiError) {
                console.warn('Primary directions API failed, using straight-line fallback');
                // If API fails completely, create a simple route object
                directionsData = {
                    primary: {
                        distanceText: '---',
                        durationText: 'Distance calculated',
                        summary: 'Direct line route (API unavailable)'
                    },
                    isFallback: true
                };
            }

            if (directionsData && directionsData.primary) {
                // Store for use in card generation
                window._alternativeRoutesData = directionsData;
                
                // Draw route on map if we have polyline data
                if (directionsData.primary.polyline) {
                    GoogleDirections.drawRouteOnMap(window.mapInstance, directionsData, {
                        color: directionsData.isFallback ? '#FFC107' : '#007bff',
                        weight: 4
                    });
                }

                // Display detailed route information
                const routeCard = GoogleDirections.getRouteInfoCard(directionsData);
                document.getElementById('routeInfo').innerHTML = routeCard;

                // Show success/info notification
                const primary = directionsData.primary;
                const message = directionsData.isFallback 
                    ? `📍 Using straight-line route: ${primary.distanceText} (${transportMode})`
                    : `📍 Route calculated: ${primary.distanceText} • ${primary.durationText} (${transportMode})`;
                
                if (directionsData.isFallback) {
                    NotificationManager.warning(message);
                } else {
                    NotificationManager.success(message);
                }
            } else {
                NotificationManager.warning('Could not calculate route. Try different locations or mode of transport.');
            }
        } catch (error) {
            console.error('Error getting directions:', error);
            NotificationManager.error(`⚠️ Directions unavailable: ${error.message}. Try different locations.`);
        }
    }

    /**
     * Initialize traffic visualization
     */
    function initializeTrafficVisualization() {
        // Initialize heatmap library
        HeatmapAnalytics.initializeHeatmap().then((initialized) => {
            if (initialized) {
                // Draw initial visualizations
                setTimeout(() => {
                    HeatmapAnalytics.drawHeatmap(window.mapInstance);
                    HeatmapAnalytics.drawCrowdDensity(window.mapInstance);
                    refreshTrafficData();
                }, 1000);

                // Update every 2 minutes
                setInterval(() => {
                    HeatmapAnalytics.updateHeatmap(window.mapInstance);
                    refreshTrafficData();
                }, 120000);
            }
        });
    }

    /**
     * Refresh traffic data display
     */
    async function refreshTrafficData() {
        try {
            const trafficCard = await HeatmapAnalytics.getTrafficCard(window.mapInstance);
            const trafficStats = document.getElementById('trafficStats');
            if (trafficStats) {
                trafficStats.innerHTML = trafficCard;
            }

            // Update heatmap visuals
            await HeatmapAnalytics.updateHeatmap(window.mapInstance);
        } catch (error) {
            console.error('Error refreshing traffic:', error);
        }
    }

    /**
     * Get crowd level status for a location
     */
    async function getCrowdLevelStatus(latitude, longitude) {
        return await HeatmapAnalytics.getCrowdLevel(latitude, longitude);
    }

    /**
     * Check if location is crowded
     */
    async function isLocationCrowded(latitude, longitude) {
        return await LocationTracking.isInCrowdedArea(latitude, longitude);
    }

    /**
     * Get popular routes
     */
    async function getPopularRoutes() {
        return await LocationTracking.getPopularRoutes(24);
    }

    /**
     * Get crowded areas
     */
    async function getCrowdedAreas() {
        return await LocationTracking.getCrowdedAreas(5);
    }

    /**
     * Handle location search input
     */
    function handleLocationSearch(query, type) {
        if (!query) {
            hideLocationDropdown(type);
            return;
        }

        const results = Directions.searchLocations(query);
        if (results.length === 0) {
            hideLocationDropdown(type);
            return;
        }

        showLocationDropdown(results, type);
    }

    /**
     * Show location search suggestions
     */
    function showLocationSuggestions(type) {
        const input = document.getElementById(type === 'from' ? 'fromLocation' : 'toLocation');
        if (input && input.value.length > 0) {
            handleLocationSearch(input.value, type);
        } else if (type === 'to') {
            // Show all locations in 'to' field
            showLocationDropdown(Directions.getCampusLocations(), type);
        }
    }

    /**
     * Show all available campus locations
     */
    function showAllLocations() {
        showLocationDropdown(Directions.getCampusLocations(), 'to');
        document.getElementById('toLocation').focus();
    }

    /**
     * Display location dropdown suggestions
     */
    function showLocationDropdown(locations, type) {
        const dropdownId = type === 'from' ? 'fromLocationDropdown' : 'toLocationDropdown';
        const dropdown = document.getElementById(dropdownId);
        
        if (!dropdown || locations.length === 0) return;

        dropdown.innerHTML = locations.map(loc => `
            <button type="button" class="list-group-item list-group-item-action py-2" 
                    onclick="LocationUI.selectLocation('${loc.name}', '${loc.lat}', '${loc.lon}', '${type}')">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${loc.name}</strong>
                    <small class="text-muted">${loc.building}</small>
                </div>
                <small class="text-muted">📍 ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}</small>
            </button>
        `).join('');

        dropdown.style.display = 'block';
    }

    /**
     * Hide location dropdown
     */
    function hideLocationDropdown(type) {
        const dropdownId = type === 'from' ? 'fromLocationDropdown' : 'toLocationDropdown';
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Select location from dropdown
     */
    function selectLocation(name, lat, lon, type) {
        const inputId = type === 'from' ? 'fromLocation' : 'toLocation';
        const input = document.getElementById(inputId);
        
        if (input) {
            input.value = `${name} (${lat}, ${lon})`;
        }

        hideLocationDropdown(type);
        
        // Show selection feedback
        SmartCampusNotifications.show(
            'Location selected',
            `${type === 'from' ? 'From' : 'To'}: ${name}`,
            'success'
        );
    }

    return {
        initialize,
        startLocationTracking,
        stopLocationTracking,
        useMyLocation,
        getDirections,
        refreshTrafficData,
        getCrowdLevelStatus,
        isLocationCrowded,
        getPopularRoutes,
        getCrowdedAreas,
        selectLocation,
        isTrackingLocation: () => isTrackingLocation,
        getCurrentLocation: () => currentUserLocation
    };
})();

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LocationUI.initialize);
} else {
    LocationUI.initialize();
}
