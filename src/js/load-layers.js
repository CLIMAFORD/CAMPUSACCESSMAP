(function() {
    'use strict';
    
    // Wait for map to initialize
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(loadAllLayers, 2000);
    });
    
    function loadAllLayers() {
        // Get global map reference
        const mapRef = window.map || (window.app && window.app.map && window.app.map());
        
        if (!mapRef) {
            console.error('Map not initialized');
            return;
        }
        
        // Ensure map is centered on Maseno University
        mapRef.setView([-0.3897, 34.5905], 15);
        console.log('Map recentered on Maseno University [-0.3897, 34.5905]');
        
        // Define all layers with colors
        const layersConfig = [
            { data: 'json_Maseno_University_3', name: 'Maseno University', color: '#FF6B6B', opacity: 0.6 },
            { data: 'json_MasenoTown_1', name: 'Maseno Town', color: '#4ECDC4', opacity: 0.5 },
            { data: 'json_Forest_2', name: 'Forest', color: '#2D6A4F', opacity: 0.5 },
            { data: 'json_College_Campus_7', name: 'College Campus', color: '#FFD93D', opacity: 0.6 },
            { data: 'json_Siriba_8', name: 'Siriba Campus', color: '#6BCB77', opacity: 0.5 },
            { data: 'json_Forests_4', name: 'Forests', color: '#1B4D3E', opacity: 0.5 },
            { data: 'json_Fields_5', name: 'Fields', color: '#9FD356', opacity: 0.5 },
            { data: 'json_Niles_6', name: 'Niles', color: '#A8DADC', opacity: 0.5 },
            { data: 'json_Niles_bldngs_9', name: 'Niles Buildings', color: '#E63946', opacity: 0.6 },
            { data: 'json_Siriba_bldngs_10', name: 'Siriba Buildings', color: '#F77F00', opacity: 0.6 },
            { data: 'json_CC_bldngs_11', name: 'CC Buildings', color: '#06D6A0', opacity: 0.6 },
            { data: 'json_MasenoRoads_12', name: 'Maseno Roads', color: '#333333', opacity: 0.8 }
        ];
        
        // Load each layer
        layersConfig.forEach(layerConfig => {
            const layerData = window[layerConfig.data];
            
            if (!layerData) {
                console.warn(`Data not found: ${layerConfig.data}`);
                return;
            }
            
            try {
                const layer = L.geoJson(layerData, {
                    style: function(feature) {
                        return {
                            color: layerConfig.color,
                            fillColor: layerConfig.color,
                            fillOpacity: layerConfig.opacity,
                            weight: 2,
                            opacity: 0.8
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        layer.bindPopup(`<b>${layerConfig.name}</b>`);
                    }
                }).addTo(mapRef);
                
                console.log(`✓ ${layerConfig.name} loaded`);
            } catch (e) {
                console.error(`✗ Failed to load ${layerConfig.name}:`, e);
            }
        });
        
        console.log('All layers loaded successfully');
    }
})();