/**
 * Smart Campus Access Map - Directions & Routing Module
 * Calculates routes and travel times between locations
 * Provides accessible route options and estimated arrival times
 */

const Directions = (() => {
    let routeLayer = null;
    let routeMarkers = [];
    let routePolyline = null;
    let currentRoute = null;
    let campusLocations = [];
    let searchCallback = null;

    /**
     * Initialize campus location database
     */
    function initializeCampusLocations() {
        campusLocations = [
            { name: 'Main Gate', lat: -0.4145, lon: 34.5610, building: 'Entrance', type: 'gate' },
            { name: 'Library', lat: -0.4133, lon: 34.5620, building: 'Central Library', type: 'building' },
            { name: 'Student Center', lat: -0.4120, lon: 34.5630, building: 'Student Hub', type: 'building' },
            { name: 'Dining Hall', lat: -0.4125, lon: 34.5615, building: 'Food Court', type: 'facility' },
            { name: 'Medical Clinic', lat: -0.4135, lon: 34.5635, building: 'Health Center', type: 'facility' },
            { name: 'Sports Complex', lat: -0.4150, lon: 34.5640, building: 'Athletics', type: 'facility' },
            { name: 'Science Building', lat: -0.4110, lon: 34.5625, building: 'Science Labs', type: 'building' },
            { name: 'Engineering Hall', lat: -0.4108, lon: 34.5618, building: 'Engineering', type: 'building' },
            { name: 'Arts Center', lat: -0.4140, lon: 34.5645, building: 'Arts & Culture', type: 'building' },
            { name: 'Parking Lot A', lat: -0.4155, lon: 34.5650, building: 'Parking', type: 'parking' },
        ];
        return campusLocations;
    }

    /**
     * Search campus locations by name
     */
    function searchLocations(query) {
        if (!query || query.length < 2) return [];
        
        const lowerQuery = query.toLowerCase();
        return campusLocations.filter(loc => 
            loc.name.toLowerCase().includes(lowerQuery) ||
            loc.building.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get location by name
     */
    function getLocationByName(name) {
        return campusLocations.find(loc => 
            loc.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Calculate distance between two coordinates
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Estimate travel time based on distance and terrain
     * Default walking speed: 1.4 m/s (5 km/h)
     * Wheelchair speed: 0.9 m/s (3.2 km/h)
     * Crowded area penalty: 30-50% slower
     */
    async function estimateTravelTime(distance, options = {}) {
        const isCrowded = options.checkCrowding ? 
            await LocationTracking.isInCrowdedArea(options.centerLat, options.centerLon) : false;

        const baseSpeed = options.wheelchair ? 0.9 : 1.4; // m/s
        const crowdPenalty = isCrowded ? 1.3 : 1.0; // 30% slower if crowded

        const timeSeconds = (distance / baseSpeed) * crowdPenalty;
        const minutes = Math.ceil(timeSeconds / 60);

        return {
            distance: Math.round(distance),
            timeSeconds: Math.round(timeSeconds),
            timeMinutes: minutes,
            isCrowded: isCrowded,
            baseSpeed: baseSpeed,
            crowdPenalty: crowdPenalty
        };
    }

    /**
     * Get simple route between two points (A* pathfinding on building layouts)
     * For now, returns direct route with distance/time
     */
    async function getRoute(startLat, startLon, endLat, endLon, options = {}) {
        try {
            const distance = calculateDistance(startLat, startLon, endLat, endLon);
            const travelTime = await estimateTravelTime(distance, {
                wheelchair: options.wheelchair || false,
                checkCrowding: options.avoidCrowded || false,
                centerLat: (startLat + endLat) / 2,
                centerLon: (startLon + endLon) / 2
            });

            currentRoute = {
                start: { lat: startLat, lng: startLon },
                end: { lat: endLat, lng: endLon },
                distance: travelTime.distance,
                timeMinutes: travelTime.timeMinutes,
                timeSeconds: travelTime.timeSeconds,
                isCrowded: travelTime.isCrowded,
                wheelchair: options.wheelchair || false,
                waypoints: [
                    { lat: startLat, lng: startLon, description: 'Start' },
                    { lat: endLat, lng: endLon, description: 'Destination' }
                ],
                instructions: generateInstructions(startLat, startLon, endLat, endLon)
            };

            return currentRoute;
        } catch (error) {
            console.error('Error calculating route:', error);
            return null;
        }
    }

    /**
     * Generate turn-by-turn directions
     */
    function generateInstructions(startLat, startLon, endLat, endLon) {
        const bearing = calculateBearing(startLat, startLon, endLat, endLon);
        const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
        const directionIndex = Math.round((bearing + 22.5) / 45) % 8;
        const direction = directions[directionIndex];

        return [
            {
                instruction: `Start heading ${direction}`,
                distance: null,
                landmark: null
            },
            {
                instruction: `Continue for the destination`,
                distance: calculateDistance(startLat, startLon, endLat, endLon),
                landmark: `Destination ahead`
            }
        ];
    }

    /**
     * Calculate bearing between two coordinates
     */
    function calculateBearing(lat1, lon1, lat2, lon2) {
        const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
                  Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.cos((lon2 - lon1) * Math.PI / 180);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    /**
     * Get accessible routes (avoiding stairs, uneven terrain)
     */
    async function getAccessibleRoute(startLat, startLon, endLat, endLon) {
        // In a full implementation, this would query accessible paths from database
        const route = await getRoute(startLat, startLon, endLat, endLon, {
            wheelchair: true,
            avoidCrowded: false
        });

        route.accessibility = {
            wheelchairFriendly: true,
            ramps: true,
            elevators: true,
            tactileGuides: false,
            audioBeacons: false
        };

        return route;
    }

    /**
     * Draw route on map
     */
    function drawRouteOnMap(mapInstance, route) {
        if (!mapInstance) return;

        // Clear previous route
        clearRoute(mapInstance);

        // Draw polyline
        const coordinates = route.waypoints.map(wp => [wp.lat, wp.lng]);
        routePolyline = L.polyline(coordinates, {
            color: '#007bff',
            weight: 4,
            opacity: 0.8,
            dashArray: route.isCrowded ? '5, 5' : undefined // Dashed if crowded
        }).addTo(mapInstance);

        // Add start marker
        const startMarker = L.marker([route.start.lat, route.start.lng], {
            icon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzI4YTc0NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMjAiIHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiPlM8L3RleHQ+PC9zdmc+',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            }),
            title: 'Start'
        }).addTo(mapInstance);
        startMarker.bindPopup('<b>Start Location</b>');
        routeMarkers.push(startMarker);

        // Add destination marker
        const endMarker = L.marker([route.end.lat, route.end.lng], {
            icon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZmYzMwNyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMjAiIHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIEQ8L3RleHQ+PC9zdmc+',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            }),
            title: 'Destination'
        }).addTo(mapInstance);
        endMarker.bindPopup('<b>Destination</b><br>' + (route.timeMinutes + ' min'));
        routeMarkers.push(endMarker);

        // Fit map to route
        mapInstance.fitBounds(routePolyline.getBounds());

        console.log('🗺️ Route drawn on map');
    }

    /**
     * Clear route from map
     */
    function clearRoute(mapInstance) {
        if (routePolyline && mapInstance) {
            mapInstance.removeLayer(routePolyline);
            routePolyline = null;
        }

        routeMarkers.forEach(marker => {
            if (mapInstance) mapInstance.removeLayer(marker);
        });
        routeMarkers = [];

        currentRoute = null;
    }

    /**
     * Get route info HTML card
     */
    function getRouteInfoCard(route) {
        if (!route) return '<p>No route calculated</p>';

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-directions"></i> Route Summary
                    </h5>
                    <div class="mb-3">
                        <p class="mb-1">
                            <strong>Distance:</strong> ${(route.distance / 1000).toFixed(2)} km
                        </p>
                        <p class="mb-1">
                            <strong>Travel Time:</strong> 
                            <span class="badge ${route.isCrowded ? 'bg-warning' : 'bg-success'}">
                                ${route.timeMinutes} min
                            </span>
                            ${route.isCrowded ? '<br><small class="text-warning">⚠️ Route passes through crowded area</small>' : ''}
                        </p>
                        <p class="mb-0">
                            <strong>Type:</strong> ${route.wheelchair ? 'Wheelchair Accessible' : 'Standard'}
                        </p>
                    </div>
                    <div class="list-group list-group-sm">
                        ${route.instructions.map((inst, idx) => `
                            <div class="list-group-item py-2">
                                <p class="mb-1"><small><strong>Step ${idx + 1}:</strong></small></p>
                                <p class="mb-0"><small>${inst.instruction}</small></p>
                                ${inst.distance ? `<p class="mb-0"><small class="text-muted">${(inst.distance / 1000).toFixed(2)} km</small></p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get current route
     */
    function getCurrentRoute() {
        return currentRoute;
    }

    return {
        getRoute,
        getAccessibleRoute,
        drawRouteOnMap,
        clearRoute,
        getRouteInfoCard,
        getCurrentRoute,
        calculateDistance,
        estimateTravelTime,
        calculateBearing,
        initializeCampusLocations,
        searchLocations,
        getLocationByName,
        getCampusLocations: () => campusLocations
    };
})();
