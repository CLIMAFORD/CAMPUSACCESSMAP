/**
 * Smart Campus Access Map - Geolocation Tracking Module
 * Tracks user locations in real-time for traffic pattern analysis
 * Integrates with Firestore for heatmap and crowding analysis
 */

const LocationTracking = (() => {
    let locationWatch = null;
    let currentLocation = null;
    let isTracking = false;
    let trackingInterval = 30000; // 30 seconds default
    let subscribers = [];

    /**
     * Request permission and start tracking user location
     */
    async function startTracking(interval = 30000) {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported by browser');
            return false;
        }

        try {
            trackingInterval = interval;
            isTracking = true;

            // Request one-time location first
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString(),
                        userId: FirebaseSync.userId ? FirebaseSync.userId() : 'anonymous'
                    };

                    console.log('✅ Location permission granted', currentLocation);
                    notifySubscribers(currentLocation);
                    sendLocationToFirebase(currentLocation);

                    // Start continuous tracking
                    continuousTracking();
                },
                (error) => {
                    console.warn('Location permission denied:', error.message);
                    isTracking = false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

            return true;
        } catch (error) {
            console.error('Location tracking error:', error);
            return false;
        }
    }

    /**
     * Continuous location tracking at intervals
     */
    function continuousTracking() {
        if (!isTracking) return;

        locationWatch = setInterval(() => {
            if (!isTracking) {
                clearInterval(locationWatch);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString(),
                        userId: FirebaseSync.userId ? FirebaseSync.userId() : 'anonymous'
                    };

                    notifySubscribers(currentLocation);
                    sendLocationToFirebase(currentLocation);
                },
                (error) => {
                    console.warn('Location update error:', error.message);
                },
                {
                    enableHighAccuracy: false, // Balance accuracy and battery
                    timeout: 5000,
                    maximumAge: 5000 // Cache for 5 seconds
                }
            );
        }, trackingInterval);
    }

    /**
     * Send location update to Firebase Firestore
     */
    async function sendLocationToFirebase(location) {
        if (!FIREBASE_ENABLED || !HybridStorageManager) return;

        // Check if Firebase is available
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('ℹ️ Firebase SDK not yet loaded, location not synced to cloud');
            return;
        }

        try {
            const db = firebase.firestore();
            const userId = location.userId;
            const timestamp = new Date();

            // Add to active locations collection (for real-time heatmap)
            await db.collection('activeLocations').doc(userId).set({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Also store in location history (for analytics)
            await db.collection('locationHistory').add({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                date: firebase.firestore.Timestamp.fromDate(new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate()))
            });

            console.log('📍 Location sent to Firebase');
        } catch (error) {
            console.warn('ℹ️ Could not sync location to Firebase:', error.message);
        }
    }

    /**
     * Stop tracking location
     */
    function stopTracking() {
        isTracking = false;
        if (locationWatch) {
            clearInterval(locationWatch);
            locationWatch = null;
        }
        console.log('🛑 Location tracking stopped');
    }

    /**
     * Get current location
     */
    function getCurrentLocation() {
        return currentLocation;
    }

    /**
     * Check if currently tracking
     */
    function isCurrentlyTracking() {
        return isTracking;
    }

    /**
     * Subscribe to location changes
     */
    function subscribe(callback) {
        subscribers.push(callback);
        return () => {
            subscribers = subscribers.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all subscribers of location change
     */
    function notifySubscribers(location) {
        subscribers.forEach(cb => {
            try {
                cb(location);
            } catch (error) {
                console.error('Subscriber error:', error);
            }
        });
    }

    /**
     * Get crowd density at specific location
     */
    async function getCrowdDensity(latitude, longitude, radiusMeters = 50) {
        if (!FIREBASE_ENABLED) return null;

        try {
            const db = firebase.firestore();
            const locations = await db.collection('activeLocations').get();

            let count = 0;
            locations.forEach(doc => {
                const data = doc.data();
                const distance = calculateDistance(
                    latitude, longitude,
                    data.latitude, data.longitude
                );

                if (distance <= radiusMeters) {
                    count++;
                }
            });

            return {
                density: count,
                radius: radiusMeters,
                center: { latitude, longitude },
                level: count < 3 ? 'low' : count < 10 ? 'medium' : 'high'
            };
        } catch (error) {
            console.error('Error getting crowd density:', error);
            return null;
        }
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
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
     * Get heatmap data for a region
     */
    async function getHeatmapData(boundsLatLng) {
        if (!FIREBASE_ENABLED) return [];

        // Check if Firebase is available
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('ℹ️ Firebase SDK not yet loaded, using local data only');
            return [];
        }

        try {
            const db = firebase.firestore();
            const locations = await db.collection('activeLocations').get();

            const heatmapPoints = [];
            locations.forEach(doc => {
                const data = doc.data();

                // Check if location is within bounds
                if (data.latitude >= boundsLatLng.south &&
                    data.latitude <= boundsLatLng.north &&
                    data.longitude >= boundsLatLng.west &&
                    data.longitude <= boundsLatLng.east) {

                    heatmapPoints.push({
                        lat: data.latitude,
                        lng: data.longitude,
                        weight: 1 // Each user = 1 point
                    });
                }
            });

            return heatmapPoints;
        } catch (error) {
            console.warn('ℹ️ Could not retrieve heatmap data:', error.message);
            return [];
        }
    }

    /**
     * Get popular routes and paths (high traffic areas)
     */
    async function getPopularRoutes(timeRange = 24) {
        if (!FIREBASE_ENABLED) return [];

        // Check if Firebase is available
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('ℹ️ Firebase SDK not yet loaded, traffic data not available');
            return [];
        }

        try {
            const db = firebase.firestore();
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - timeRange);

            const history = await db.collection('locationHistory')
                .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startTime))
                .get();

            // Group by grid cells to find popular paths
            const gridSize = 0.0005; // Approximately 50 meters
            const grid = {};

            history.forEach(doc => {
                const data = doc.data();
                const gridKey = Math.floor(data.latitude / gridSize) + ',' + Math.floor(data.longitude / gridSize);

                if (!grid[gridKey]) {
                    grid[gridKey] = {
                        count: 0,
                        lat: Math.floor(data.latitude / gridSize) * gridSize,
                        lng: Math.floor(data.longitude / gridSize) * gridSize
                    };
                }
                grid[gridKey].count++;
            });

            // Convert to array and sort by traffic
            return Object.values(grid)
                .sort((a, b) => b.count - a.count)
                .slice(0, 20); // Top 20 areas
        } catch (error) {
            console.warn('ℹ️ Could not retrieve popular routes:', error.message);
            return [];
        }
    }

    /**
     * Get crowded hallways and bottlenecks
     */
    async function getCrowdedAreas(threshold = 5) {
        if (!FIREBASE_ENABLED) return [];

        try {
            const routes = await getPopularRoutes();
            return routes.filter(route => route.count >= threshold);
        } catch (error) {
            console.error('Error getting crowded areas:', error);
            return [];
        }
    }

    /**
     * Check if location is in crowded area
     */
    async function isInCrowdedArea(latitude, longitude, threshold = 5) {
        const density = await getCrowdDensity(latitude, longitude, 100);
        return density && density.density >= threshold;
    }

    return {
        startTracking,
        stopTracking,
        getCurrentLocation,
        isCurrentlyTracking,
        subscribe,
        getCrowdDensity,
        getHeatmapData,
        getPopularRoutes,
        getCrowdedAreas,
        isInCrowdedArea,
        calculateDistance
    };
})();
