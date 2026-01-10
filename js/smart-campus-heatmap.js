/**
 * Smart Campus Access Map - Heatmap & Traffic Analysis Module
 * Visualizes crowd density and traffic patterns on the map
 * Creates heatmaps and density overlays for identifying bottlenecks
 */

const HeatmapAnalytics = (() => {
    let heatmapLayer = null;
    let crowdDensityLayer = null;
    let crowdMarkers = [];
    let heatmapData = [];

    /**
     * Initialize heatmap library (Leaflet.heat)
     * Requires: https://leaflet.github.io/Leaflet.heat/dist/leaflet-heat.js
     */
    async function initializeHeatmap() {
        // Check if leaflet-heat is loaded
        if (typeof L.heatLayer !== 'function') {
            console.warn('Leaflet.heat not loaded. Add: <script src="https://leaflet.github.io/Leaflet.heat/dist/leaflet-heat.js"></script>');
            return false;
        }
        return true;
    }

    /**
     * Draw heatmap of current user locations
     */
    async function drawHeatmap(mapInstance) {
        if (!mapInstance || !L.heatLayer) {
            console.error('Map or Leaflet.heat not initialized');
            return;
        }

        try {
            // Get heatmap data from location tracking
            const bounds = mapInstance.getBounds();
            const heatData = await LocationTracking.getHeatmapData({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            });

            if (heatData.length === 0) {
                console.log('No location data available for heatmap');
                return;
            }

            // Remove old heatmap
            if (heatmapLayer) {
                mapInstance.removeLayer(heatmapLayer);
            }

            // Create new heatmap with intensity based on user density
            heatmapLayer = L.heatLayer(
                heatData.map(point => [point.lat, point.lng, point.weight]),
                {
                    radius: 40,
                    blur: 25,
                    maxZoom: 18,
                    gradient: {
                        0.0: '#00ff00', // Green - low traffic
                        0.3: '#ffff00', // Yellow - medium
                        0.6: '#ff9500', // Orange - crowded
                        1.0: '#ff0000'  // Red - very crowded
                    }
                }
            ).addTo(mapInstance);

            heatmapData = heatData;
            console.log('🔥 Heatmap drawn with', heatData.length, 'data points');
        } catch (error) {
            console.error('Error drawing heatmap:', error);
        }
    }

    /**
     * Draw crowd density circles at specific locations
     */
    async function drawCrowdDensity(mapInstance) {
        if (!mapInstance) return;

        try {
            // Clear old markers
            crowdMarkers.forEach(marker => mapInstance.removeLayer(marker));
            crowdMarkers = [];

            // Get crowded areas
            const crowdedAreas = await LocationTracking.getCrowdedAreas(3);

            crowdedAreas.forEach(area => {
                const size = area.count;
                const color = size < 5 ? '#28a745' : size < 15 ? '#ffc107' : '#dc3545';
                const opacity = Math.min(size / 30, 0.8);

                const circle = L.circle([area.lat, area.lng], {
                    radius: 20 + size * 5, // Size based on crowd
                    color: color,
                    weight: 2,
                    opacity: opacity,
                    fillOpacity: opacity * 0.5
                }).addTo(mapInstance);

                circle.bindPopup(`
                    <b>Crowd Density</b><br>
                    People nearby: ${size}<br>
                    <span class="badge" style="background-color: ${color}">
                        ${size < 5 ? 'Low' : size < 15 ? 'Medium' : 'High'} Traffic
                    </span>
                `);

                crowdMarkers.push(circle);
            });

            console.log('👥 Crowd density markers drawn:', crowdMarkers.length);
        } catch (error) {
            console.error('Error drawing crowd density:', error);
        }
    }

    /**
     * Get traffic analysis for current view
     */
    async function analyzeTraffic(mapInstance) {
        if (!mapInstance) return null;

        try {
            const bounds = mapInstance.getBounds();
            const heatData = await LocationTracking.getHeatmapData({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            });

            const crowdedAreas = await LocationTracking.getCrowdedAreas(3);
            const popularRoutes = await LocationTracking.getPopularRoutes(24);

            return {
                totalPeopleOnCampus: heatData.length,
                crowdedAreasCount: crowdedAreas.length,
                crowdedAreas: crowdedAreas,
                popularRoutes: popularRoutes,
                timestamp: new Date().toISOString(),
                analysisWindow: 'Last 24 hours'
            };
        } catch (error) {
            console.error('Error analyzing traffic:', error);
            return null;
        }
    }

    /**
     * Get traffic heatmap card HTML
     */
    async function getTrafficCard(mapInstance) {
        const analysis = await analyzeTraffic(mapInstance);

        if (!analysis) {
            return '<p class="text-muted">No traffic data available</p>';
        }

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-users"></i> Campus Traffic Analysis
                    </h5>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="stat">
                                <h3>${analysis.totalPeopleOnCampus}</h3>
                                <p class="text-muted">Active Users</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="stat">
                                <h3>${analysis.crowdedAreasCount}</h3>
                                <p class="text-muted">Crowded Areas</p>
                            </div>
                        </div>
                    </div>

                    ${analysis.crowdedAreasCount > 0 ? `
                        <div class="alert alert-warning">
                            <h6><i class="fas fa-exclamation-triangle"></i> Bottlenecks Detected</h6>
                            <ul class="mb-0">
                                ${analysis.crowdedAreas.slice(0, 5).map(area => `
                                    <li>Area near (${area.lat.toFixed(4)}, ${area.lng.toFixed(4)}) - ${area.count} people</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : '<div class="alert alert-success">✅ Campus traffic is normal</div>'}

                    <h6 class="mt-3">Popular Routes (Last 24h)</h6>
                    <div class="list-group list-group-sm">
                        ${analysis.popularRoutes.slice(0, 5).map((route, idx) => `
                            <div class="list-group-item py-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong>#${idx + 1}</strong>
                                    <span class="badge bg-info">${route.count} visits</span>
                                </div>
                                <small class="text-muted">Lat: ${route.lat.toFixed(4)}, Lon: ${route.lng.toFixed(4)}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Toggle heatmap visibility
     */
    function toggleHeatmap(mapInstance, enabled) {
        if (!mapInstance) return;

        if (enabled && !heatmapLayer) {
            drawHeatmap(mapInstance);
        } else if (!enabled && heatmapLayer) {
            mapInstance.removeLayer(heatmapLayer);
            heatmapLayer = null;
        }
    }

    /**
     * Toggle crowd density visibility
     */
    function toggleCrowdDensity(mapInstance, enabled) {
        if (!mapInstance) return;

        if (enabled) {
            drawCrowdDensity(mapInstance);
        } else {
            crowdMarkers.forEach(marker => mapInstance.removeLayer(marker));
            crowdMarkers = [];
        }
    }

    /**
     * Update heatmap visualization (refresh)
     */
    async function updateHeatmap(mapInstance) {
        if (!mapInstance) return;

        await drawHeatmap(mapInstance);
        await drawCrowdDensity(mapInstance);
    }

    /**
     * Get crowd level at specific location
     */
    async function getCrowdLevel(latitude, longitude) {
        const density = await LocationTracking.getCrowdDensity(latitude, longitude);
        
        if (!density) return { level: 'unknown', description: 'Data unavailable' };

        const levels = {
            'low': { level: 'low', description: '✅ Low traffic', color: '#28a745' },
            'medium': { level: 'medium', description: '⚠️ Moderate traffic', color: '#ffc107' },
            'high': { level: 'high', description: '🚫 High traffic', color: '#dc3545' }
        };

        return levels[density.level] || levels['low'];
    }

    /**
     * Get historical traffic data for specific time period
     */
    async function getHistoricalTraffic(startDate, endDate) {
        if (!FIREBASE_ENABLED) return null;

        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('locationHistory')
                .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
                .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(endDate))
                .get();

            const hourlyData = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp.toDate();
                const hour = date.getHours() + ':00';

                if (!hourlyData[hour]) {
                    hourlyData[hour] = 0;
                }
                hourlyData[hour]++;
            });

            return hourlyData;
        } catch (error) {
            console.error('Error getting historical traffic:', error);
            return null;
        }
    }

    return {
        initializeHeatmap,
        drawHeatmap,
        drawCrowdDensity,
        analyzeTraffic,
        getTrafficCard,
        toggleHeatmap,
        toggleCrowdDensity,
        updateHeatmap,
        getCrowdLevel,
        getHistoricalTraffic
    };
})();
