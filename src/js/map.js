// src/js/map.js
// Your existing qgis2web code goes here, but wrapped in a function

(function() {
    'use strict';
    
    // Initialize map with responsive settings
    var map = L.map('map', {
        preferCanvas: true,
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([-0.6833, 34.7667], 15); // Maseno coordinates
    
    // Store map globally for use in other files
    window.campusMap = map;
    
    // ===== BASE LAYERS =====
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    
    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    });
    
    // Add default base layer
    osmLayer.addTo(map);
    
    // ===== YOUR QGIS LAYERS =====
    // Copy your existing qgis2web layer code here
    // Look for lines starting with:
    // var MasenoRoads = L.geoJson(MasenoRoads, {...});
    // var CC_bldngs = L.geoJson(CC_bldngs, {...});
    // etc.
    
    // IMPORTANT: Keep all your existing layer definitions
    // but we'll organize them into layer groups
    
    // Create layer groups
    window.buildingLayers = L.layerGroup();
    window.roadLayers = L.layerGroup();
    window.greenSpaceLayers = L.layerGroup();
    
    // Example structure (replace with your actual layers):
    /*
    var Siriba_bldngs = L.geoJson(Siriba_bldngs, {
        style: style_Siriba_bldngs_0,
        onEachFeature: onEachFeature
    }).addTo(buildingLayers);
    
    var MasenoRoads = L.geoJson(MasenoRoads, {
        style: style_MasenoRoads_1,
        onEachFeature: onEachFeature
    }).addTo(roadLayers);
    */
    
    // Add layer groups to map
    buildingLayers.addTo(map);
    roadLayers.addTo(map);
    greenSpaceLayers.addTo(map);
    
    // ===== LAYER CONTROL =====
    var baseLayers = {
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer
    };
    
    var overlayLayers = {
        "Buildings": buildingLayers,
        "Roads": roadLayers,
        "Green Spaces": greenSpaceLayers
    };
    
    L.control.layers(baseLayers, overlayLayers, {
        collapsed: false,
        position: 'topright'
    }).addTo(map);
    
    // ===== RESPONSIVE RESIZE HANDLER =====
    function handleResize() {
        map.invalidateSize();
    }
    
    window.addEventListener('resize', handleResize);
    
    // Trigger resize after a short delay to ensure DOM is ready
    setTimeout(handleResize, 100);
    
    console.log('Map initialized successfully');
})();