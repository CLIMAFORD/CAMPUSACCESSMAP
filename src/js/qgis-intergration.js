// src/js/qgis-integration.js
// This is your QGIS2WEB map code - ADAPTED for Smart Campus

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        
        console.log('Loading Smart Campus QGIS Map Integration...');
        
        // ===== ORIGINAL QGIS2WEB CODE - COPIED FROM YOUR FILE =====
        // Copy everything from your original index.html starting from:
        // var highlightLayer;
        // To the end of the script
        
        // Here's the structure - YOU NEED TO COPY YOUR ACTUAL CODE HERE:
        
        
        // ===== START COPYING FROM HERE =====
var highlightLayer;
function highlightFeature(e) {
    highlightLayer = e.target;

    if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
      highlightLayer.setStyle({
        color: 'rgba(255, 255, 0, 1.00)',
      });
    } else {
      highlightLayer.setStyle({
        fillColor: 'rgba(255, 255, 0, 1.00)',
        fillOpacity: 1
      });
    }
}
var map = L.map('map', {
    zoomControl:false, maxZoom:28, minZoom:1
}).fitBounds([[-0.014019237932566764,34.58858076035669],[0.003651351954024558,34.61493114399558]]);

// ... COPY EVERYTHING IN BETWEEN ...

var overlaysTree = [
    {label: '<img src="legend/MasenoRoads_12.png" /> MasenoRoads', layer: layer_MasenoRoads_12},
    {label: '<img src="legend/CC_bldngs_11.png" /> CC_bldngs', layer: layer_CC_bldngs_11},
    {label: '<img src="legend/Siriba_bldngs_10.png" /> Siriba_bldngs', layer: layer_Siriba_bldngs_10},
    {label: '<img src="legend/Niles_bldngs_9.png" /> Niles_bldngs', layer: layer_Niles_bldngs_9},
    {label: '<img src="legend/Siriba_8.png" /> Siriba', layer: layer_Siriba_8},
    {label: '<img src="legend/College_Campus_7.png" /> College_Campus', layer: layer_College_Campus_7},
    {label: '<img src="legend/Niles_6.png" /> Niles', layer: layer_Niles_6},
    {label: '<img src="legend/Fields_5.png" /> Fields', layer: layer_Fields_5},
    {label: '<img src="legend/Forests_4.png" /> Forests', layer: layer_Forests_4},
    {label: '<img src="legend/Maseno_University_3.png" /> Maseno_University', layer: layer_Maseno_University_3},
    {label: '<img src="legend/Forest_2.png" /> Forest', layer: layer_Forest_2},
    {label: '<img src="legend/MasenoTown_1.png" /> MasenoTown', layer: layer_MasenoTown_1},
    {label: "OSM Standard", layer: layer_OSMStandard_0, radioGroup: 'bm' },]
var lay = L.control.layers.tree(null, overlaysTree,{
    collapsed: true,
});
lay.addTo(map);
setBounds();

// ===== END COPYING HERE =====
        var highlightLayer;
        function highlightFeature(e) {
            highlightLayer = e.target;
            if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
              highlightLayer.setStyle({
                color: 'rgba(255, 255, 0, 1.00)',
              });
            } else {
              highlightLayer.setStyle({
                fillColor: 'rgba(255, 255, 0, 1.00)',
                fillOpacity: 1
              });
            }
        }
        
        var map = L.map('map', {
            zoomControl:false, maxZoom:28, minZoom:1
        }).fitBounds([[-0.014019237932566764,34.58858076035669],[0.003651351954024558,34.61493114399558]]);
        
        // ... ALL YOUR LAYER CODE GOES HERE ...
        // Copy everything until the end
        
        var overlaysTree = [
            {label: '<img src="legend/MasenoRoads_12.png" /> MasenoRoads', layer: layer_MasenoRoads_12},
            // ... all other layers
        ];
        
        var lay = L.control.layers.tree(null, overlaysTree,{
            collapsed: true,
        });
        lay.addTo(map);
        setBounds();
        
        // ===== IMPORTANT: AFTER COPYING YOUR CODE, ADD THESE MODIFICATIONS =====
        
        // 1. Make map responsive
        function resizeMap() {
            if (window.campusMap) {
                window.campusMap.invalidateSize();
            }
        }
        
        // Initial resize
        setTimeout(resizeMap, 100);
        
        // Resize on window resize
        window.addEventListener('resize', resizeMap);
        
        // 2. Move layer control to sidebar after delay
        setTimeout(function() {
            var treeControl = document.querySelector('.leaflet-control-layers-tree');
            var layerContainer = document.getElementById('layer-container');
            
            if (treeControl && layerContainer) {
                layerContainer.innerHTML = '';
                layerContainer.appendChild(treeControl);
                
                // Style the tree control
                treeControl.style.cssText = `
                    display: block !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                `;
                
                // Hide original map control
                var mapControl = document.querySelector('.leaflet-control-layers');
                if (mapControl) {
                    mapControl.style.display = 'none';
                }
                
                console.log('Layer control moved to sidebar');
            }
        }, 1500);
        
        // 3. Connect tool buttons
        document.getElementById('locate-btn').addEventListener('click', function() {
            // Trigger locate control
            var locateBtn = document.querySelector('.leaflet-control-locate a');
            if (locateBtn) locateBtn.click();
        });
        
        document.getElementById('measure-btn').addEventListener('click', function() {
            // Trigger measure control
            var measureBtn = document.querySelector('.leaflet-control-measure-toggle');
            if (measureBtn) measureBtn.click();
        });
        
        document.getElementById('search-btn').addEventListener('click', function() {
            // Trigger search control
            var searchBtn = document.querySelector('.gcd-gl-btn');
            if (searchBtn) searchBtn.click();
        });
        
        // 4. Make map available globally
        window.campusMap = map;
        
        console.log('QGIS Map Integration Complete');
    });
    
})();