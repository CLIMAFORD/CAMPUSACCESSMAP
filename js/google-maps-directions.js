/**
 * Google Maps Directions API Integration
 * Provides real road-following directions using Google Maps API
 * Supports place name search and multiple transport modes
 */

const GoogleDirections = (() => {
    // Google Maps API Key - Add your API key here
    const GOOGLE_MAPS_API_KEY = 'AIzaSyBVBL7IBMy0QVdD-E3jKPIMXWYHQHJPGYY';
    
    // Cache for geocoding results
    const geocodeCache = {};
    
    // Campus location bounds for search
    const SEARCH_BOUNDS = {
        south: -0.430,
        west: 34.550,
        north: -0.400,
        east: 34.580
    };

    /**
     * Convert place name to coordinates using Google Geocoding API
     * Falls back to local campus database if API fails
     */
    async function geocodePlace(placeQuery) {
        // Check cache first
        if (geocodeCache[placeQuery]) {
            return geocodeCache[placeQuery];
        }

        // First try: Check if it's already coordinates (lat, lon format)
        const coordMatch = placeQuery.match(/^([-\d.]+)\s*,\s*([-\d.]+)$/);
        if (coordMatch) {
            const location = {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2]),
                placeName: placeQuery,
                placeId: null
            };
            geocodeCache[placeQuery] = location;
            return location;
        }

        // Second try: Check local campus database first
        if (typeof Directions !== 'undefined' && Directions.getCampusLocations) {
            const locations = Directions.getCampusLocations();
            const lowerQuery = placeQuery.toLowerCase();
            
            for (const loc of locations) {
                if (loc.name.toLowerCase().includes(lowerQuery) || 
                    loc.building.toLowerCase().includes(lowerQuery)) {
                    const location = {
                        lat: loc.lat,
                        lng: loc.lon,
                        placeName: loc.name,
                        placeId: null
                    };
                    geocodeCache[placeQuery] = location;
                    console.log(`📍 Found in campus database: ${placeQuery} → ${loc.name}`);
                    return location;
                }
            }
        }

        // Third try: Use Google Geocoding API (may fail if rate limited)
        try {
            // Build URL for Google Geocoding API
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeQuery)}&bounds=${SEARCH_BOUNDS.south},${SEARCH_BOUNDS.west}|${SEARCH_BOUNDS.north},${SEARCH_BOUNDS.east}&key=${GOOGLE_MAPS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                const location = {
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng,
                    placeName: result.formatted_address,
                    placeId: result.place_id
                };

                // Cache result
                geocodeCache[placeQuery] = location;
                console.log(`🗺️ Geocoded via Google Maps: ${placeQuery}`);
                return location;
            } else if (data.status === 'ZERO_RESULTS') {
                console.warn(`No results found for: ${placeQuery}. Try: "Main Gate" or "lat, lon"`);
                return null;
            } else if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
                console.warn(`Google Maps API error (${data.status}). Using local campus database. Try searching campus location names like "Main Gate" or enter coordinates.`);
                return null;
            } else {
                console.error(`Geocoding error: ${data.status}`);
                return null;
            }
        } catch (error) {
            console.warn('Geocoding fetch error (API may be rate limited):', error.message);
            console.log('💡 Tip: Use campus location names like "Main Gate" or enter coordinates "lat,lon"');
            return null;
        }
    }

    /**
     * Get directions using Google Maps Directions API
     * Returns road-following routes with proper turn-by-turn instructions
     */
    async function getDirections(origin, destination, options = {}) {
        try {
            // If origin/destination are strings, geocode them first
            let originCoords = origin;
            let destCoords = destination;

            if (typeof origin === 'string') {
                originCoords = await geocodePlace(origin);
                if (!originCoords) {
                    throw new Error(`Could not find coordinates for: ${origin}`);
                }
            }

            if (typeof destination === 'string') {
                destCoords = await geocodePlace(destination);
                if (!destCoords) {
                    throw new Error(`Could not find coordinates for: ${destination}`);
                }
            }

            const mode = options.mode || 'walking'; // walking, driving, transit, bicycling
            
            // Build URL for Google Directions API
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=${mode}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.routes.length > 0) {
                // Return best route with all alternates
                return parseDirectionsResponse(data, mode);
            } else if (data.status === 'NOT_FOUND') {
                throw new Error('Could not find route. Try different locations.');
            } else {
                throw new Error(`Directions error: ${data.status}`);
            }
        } catch (error) {
            console.error('Directions fetch error:', error);
            throw error;
        }
    }

    /**
     * Parse Google Directions API response into our format
     */
    function parseDirectionsResponse(data, mode) {
        const routes = [];

        data.routes.forEach((route, index) => {
            const leg = route.legs[0]; // We're doing point-to-point, so first leg is main
            
            // Decode polyline to get coordinates
            const polylineCoords = decodePolyline(route.overview_polyline.points);

            const routeInfo = {
                id: index,
                distance: leg.distance.value, // meters
                distanceText: leg.distance.text,
                duration: leg.duration.value, // seconds
                durationText: leg.duration.text,
                durationTraffic: leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value,
                durationTrafficText: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
                startLocation: leg.start_location,
                endLocation: leg.end_location,
                startAddress: leg.start_address,
                endAddress: leg.end_address,
                mode: mode,
                polyline: polylineCoords,
                steps: parseDirectionSteps(leg.steps),
                summary: route.summary || 'Route'
            };

            routes.push(routeInfo);
        });

        // Return best route as primary, others as alternatives
        return {
            primary: routes[0],
            alternatives: routes.slice(1),
            modeUsed: mode
        };
    }

    /**
     * Parse individual direction steps
     */
    function parseDirectionSteps(steps) {
        return steps.map(step => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
            distance: step.distance.value,
            distanceText: step.distance.text,
            duration: step.duration.value,
            durationText: step.duration.text,
            startLocation: step.start_location,
            endLocation: step.end_location,
            maneuver: step.maneuver || 'continue',
            mode: step.travel_mode
        }));
    }

    /**
     * Decode Google's polyline algorithm
     * Converts encoded polyline string to array of lat/lng coordinates
     */
    function decodePolyline(encoded) {
        const poly = [];
        let index = 0, lat = 0, lng = 0;

        while (index < encoded.length) {
            let result = 0;
            let shift = 0;
            let b;

            // Decode latitude
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            // Decode longitude
            result = 0;
            shift = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            poly.push({
                lat: lat / 1e5,
                lng: lng / 1e5
            });
        }

        return poly;
    }

    /**
     * Draw route on map with Leaflet
     */
    function drawRouteOnMap(map, routeData, options = {}) {
        if (!map || !routeData) return;

        // Remove previous route layer if exists
        if (window._currentRouteLayer) {
            map.removeLayer(window._currentRouteLayer);
        }

        const polylinePoints = routeData.primary.polyline.map(p => [p.lat, p.lng]);
        const color = options.color || '#007bff';
        const weight = options.weight || 4;

        // Draw route as polyline
        const polyline = L.polyline(polylinePoints, {
            color: color,
            weight: weight,
            opacity: 0.8,
            className: 'route-polyline'
        }).addTo(map);

        // Add start marker
        L.marker(
            [routeData.primary.startLocation.lat, routeData.primary.startLocation.lng],
            {
                icon: L.divIcon({
                    html: '<i class="fas fa-circle" style="color: #28a745; font-size: 20px;"></i>',
                    className: 'custom-direction-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                }),
                title: 'Start'
            }
        ).bindPopup('Start location').addTo(map);

        // Add end marker
        L.marker(
            [routeData.primary.endLocation.lat, routeData.primary.endLocation.lng],
            {
                icon: L.divIcon({
                    html: '<i class="fas fa-circle" style="color: #dc3545; font-size: 20px;"></i>',
                    className: 'custom-direction-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                }),
                title: 'Destination'
            }
        ).bindPopup('Destination').addTo(map);

        // Fit bounds to route
        const bounds = L.latLngBounds(polylinePoints);
        map.fitBounds(bounds, { padding: [50, 50] });

        // Store for later removal
        window._currentRouteLayer = polyline;

        return polyline;
    }

    /**
     * Generate HTML card with route information
     */
    function getRouteInfoCard(routeData) {
        if (!routeData || !routeData.primary) return '';

        const primary = routeData.primary;
        const mode = primary.mode.charAt(0).toUpperCase() + primary.mode.slice(1);

        let html = `
            <div class="route-info-card">
                <div class="route-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px 8px 0 0;">
                    <h5 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-route"></i> Route Details (${mode})
                    </h5>
                </div>
                <div class="route-details" style="padding: 15px;">
                    <div class="route-stat" style="margin-bottom: 12px;">
                        <strong><i class="fas fa-map-marker-alt"></i> Distance:</strong>
                        <span>${primary.distanceText}</span>
                    </div>
                    <div class="route-stat" style="margin-bottom: 12px;">
                        <strong><i class="fas fa-clock"></i> Duration:</strong>
                        <span>${primary.durationText}</span>
                    </div>
        `;

        // Add traffic info if available
        if (primary.durationTrafficText && primary.mode === 'driving') {
            html += `
                    <div class="route-stat" style="margin-bottom: 12px; color: #ff6b6b;">
                        <strong><i class="fas fa-traffic-light"></i> With Traffic:</strong>
                        <span>${primary.durationTrafficText}</span>
                    </div>
            `;
        }

        // Add route summary
        html += `
                    <div class="route-stat" style="margin-bottom: 12px;">
                        <strong><i class="fas fa-road"></i> Route:</strong>
                        <span>${primary.summary}</span>
                    </div>
        `;

        // Add turn-by-turn instructions (first 5 steps)
        if (primary.steps && primary.steps.length > 0) {
            html += `
                    <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                        <strong><i class="fas fa-list-ol"></i> Directions:</strong>
                        <ol style="font-size: 0.9em; margin: 10px 0 0 0; padding-left: 20px;">
            `;

            // Show first 5 steps
            primary.steps.slice(0, 5).forEach((step, idx) => {
                html += `<li>${step.instruction} (${step.distanceText})</li>`;
            });

            if (primary.steps.length > 5) {
                html += `<li><em>... and ${primary.steps.length - 5} more steps</em></li>`;
            }

            html += `
                        </ol>
                    </div>
            `;
        }

        // Add alternative routes if available
        if (window._alternativeRoutesData && window._alternativeRoutesData.alternatives && window._alternativeRoutesData.alternatives.length > 0) {
            html += `
                    <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                        <strong><i class="fas fa-share-alt"></i> Alternatives:</strong>
                        <div style="font-size: 0.85em; margin-top: 10px;">
            `;

            window._alternativeRoutesData.alternatives.slice(0, 2).forEach((alt, idx) => {
                html += `
                            <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px;">
                                <strong>Route ${idx + 2}:</strong> ${alt.distanceText} • ${alt.durationText}
                            </div>
                `;
            });

            html += `
                        </div>
                    </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Clear route from map
     */
    function clearRoute(map) {
        if (window._currentRouteLayer) {
            map.removeLayer(window._currentRouteLayer);
            window._currentRouteLayer = null;
        }
    }

    // Public API
    return {
        geocodePlace,
        getDirections,
        drawRouteOnMap,
        getRouteInfoCard,
        clearRoute,
        decodePolyline,
        SEARCH_BOUNDS
    };
})();
