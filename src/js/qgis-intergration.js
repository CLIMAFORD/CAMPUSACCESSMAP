// src/js/qgis-integration.js - MINIMAL WORKING VERSION
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DEBUG: Starting map initialization...');
        
        // 1. CHECK MAP ELEMENT
        var mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ CRITICAL: #map element not found!');
            return;
        }
        console.log('✅ Found #map element');
        console.log('📏 Map element dimensions:', mapElement.offsetWidth, 'x', mapElement.offsetHeight);
        
        // 2. CHECK LEAFLET
        if (typeof L === 'undefined') {
            console.error('❌ CRITICAL: Leaflet not loaded!');
            return;
        }
        console.log('✅ Leaflet loaded, version:', L.version);
        
        // 3. CREATE MAP
        try {
            var map = L.map('map', {
                zoomControl: true,
                maxZoom: 28,
                minZoom: 1,
                center: [-0.005185737932566764, 34.6017462701612],
                zoom: 15
            });
            
            console.log('✅ Map object created');
            
            // 4. ADD BASEMAP
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            
            console.log('✅ OSM basemap added');
            
            // 5. ADD MARKER
            L.marker([-0.005185737932566764, 34.6017462701612])
                .addTo(map)
                .bindPopup('<b>Maseno University</b><br>Test marker - map is working!')
                .openPopup();
            
            console.log('✅ Test marker added');
            
            // 6. FIX RESIZING
            function fixMapSize() {
                console.log('🔄 Fixing map size...');
                map.invalidateSize();
                
                // Force resize
                setTimeout(function() {
                    map.invalidateSize();
                    console.log('✅ Map size fixed');
                }, 100);
            }
            
            // Initial fix
            setTimeout(fixMapSize, 500);
            
            // Fix on window resize
            window.addEventListener('resize', fixMapSize);
            
            // 7. EXPORT FOR OTHER SCRIPTS
            window.campusMap = map;
            
            console.log('🎉 MAP INITIALIZATION COMPLETE!');
            
            // 8. DEBUG: Check every second if map is visible
            var debugInterval = setInterval(function() {
                console.log('🔍 DEBUG - Map dimensions:', 
                    'width:', mapElement.offsetWidth, 
                    'height:', mapElement.offsetHeight,
                    'visible:', mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0
                );
                
                if (mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0) {
                    console.log('✅ Map is visible!');
                    clearInterval(debugInterval);
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Map creation failed:', error);
        }
    });
})();