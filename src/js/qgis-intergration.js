// src/js/qgis-integration.js - UPDATED VERSION
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing Smart Campus Map...');
        
        // Suppress Leaflet deprecation warnings (temporarily)
        L.Wixin = L.Wixin || {};
        L.Wixin.Events = L.Evented;
        
        try {
            // ===== MAP INITIALIZATION =====
            var map = L.map('map', {
                zoomControl: false,
                maxZoom: 28,
                minZoom: 1
            }).setView([-0.005185737932566764, 34.6017462701612], 15);
            
            var hash = new L.Hash(map);
            map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a>');
            
            // ===== BASE LAYER =====
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            
            // ===== LOAD QGIS2WEB DATA LAYERS =====
            // This is where your original QGIS2WEB code should go
            // Copy from your original index.html starting at line 10
            
            // IMPORTANT: You need to copy your original QGIS2WEB JavaScript code here
            // Starting from: var highlightLayer;
            // Ending before: </script>
            
            // ===== SAMPLE DATA - TEMPORARY =====
            console.log('Loading sample data layers...');
            
            // Example layer - replace with your actual data
            var sampleLayer = L.geoJSON({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [34.6017462701612, -0.005185737932566764]
                    },
                    properties: {
                        name: 'Maseno University',
                        description: 'Main Campus'
                    }
                }]
            }).addTo(map);
            
            // ===== MAP CONTROLS =====
            L.control.zoom({position: 'topleft'}).addTo(map);
            
            // Locate control
            if (typeof L.Control.Locate !== 'undefined') {
                L.control.locate({position: 'topleft'}).addTo(map);
            }
            
            // Measure control
            if (typeof L.Control.Measure !== 'undefined') {
                var measureControl = new L.Control.Measure({
                    position: 'topleft',
                    primaryLengthUnit: 'meters',
                    secondaryLengthUnit: 'kilometers'
                });
                measureControl.addTo(map);
            }
            
            // ===== MAKE MAP RESPONSIVE =====
            function resizeMap() {
                map.invalidateSize();
            }
            
            setTimeout(resizeMap, 100);
            window.addEventListener('resize', resizeMap);
            
            // ===== MAKE MAP AVAILABLE GLOBALLY =====
            window.campusMap = map;
            
            console.log('✓ Smart Campus Map Initialized Successfully');
            
        } catch(err) {
            console.error('Map initialization error:', err);
        }
    });
})();