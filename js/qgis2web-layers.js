/**
 * QGIS2Web Layer Initialization
 * Initializes all GeoJSON layers from qgis2web export with correct styling
 */

function initQGIS2WebLayers(map) {
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
    
    function removeEmptyRowsFromPopupContent(content, feature) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        var rows = tempDiv.querySelectorAll('tr');
        for (var i = 0; i < rows.length; i++) {
            var td = rows[i].querySelector('td.visible-with-data');
            var key = td ? td.id : '';
            if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
                rows[i].parentNode.removeChild(rows[i]);
            }
        }
        return tempDiv.innerHTML;
    }

    function addClassToPopupIfMedia(content, popup) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        var imgTd = tempDiv.querySelector('td img');
        if (imgTd) {
            var src = imgTd.getAttribute('src');
            if (/\.(jpg|jpeg|png|gif|bmp|webp|avif)$/i.test(src)) {
                popup._contentNode.classList.add('media');
                setTimeout(function() {
                    popup.update();
                }, 10);
            }
        } else {
            popup._contentNode.classList.remove('media');
        }
    }

    var bounds_group = new L.featureGroup([]);
    var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
    var layersMap = {};

    // MasenoTown_1
    function pop_MasenoTown_1(feature, layer) {
        layer.on({
            mouseout: function(e) {
                for (var i in e.target._eventParents) {
                    if (typeof e.target._eventParents[i].resetStyle === 'function') {
                        e.target._eventParents[i].resetStyle(e.target);
                    }
                }
            },
            mouseover: highlightFeature,
        });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['full_id'] !== null ? autolinker.link(String(feature.properties['full_id']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.on('popupopen', function(e) {
            addClassToPopupIfMedia(content, e.popup);
        });
        layer.bindPopup(content, { maxHeight: 400 });
    }

    function style_MasenoTown_1_0() {
        return {
            pane: 'pane_MasenoTown_1',
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            dashArray: '',
            lineCap: 'butt',
            lineJoin: 'miter',
            weight: 1.0, 
            fill: true,
            fillOpacity: 1,
            fillColor: 'rgba(196,60,57,1.0)',
            interactive: true,
        }
    }

    map.createPane('pane_MasenoTown_1');
    map.getPane('pane_MasenoTown_1').style.zIndex = 401;
    map.getPane('pane_MasenoTown_1').style['mix-blend-mode'] = 'normal';
    var layer_MasenoTown_1 = new L.geoJson(json_MasenoTown_1, {
        attribution: '',
        interactive: true,
        dataVar: 'json_MasenoTown_1',
        layerName: 'layer_MasenoTown_1',
        pane: 'pane_MasenoTown_1',
        onEachFeature: pop_MasenoTown_1,
        style: style_MasenoTown_1_0,
    });
    bounds_group.addLayer(layer_MasenoTown_1);
    map.addLayer(layer_MasenoTown_1);
    layersMap.MasenoTown_1 = layer_MasenoTown_1;

    // Forest_2
    map.createPane('pane_Forest_2');
    map.getPane('pane_Forest_2').style.zIndex = 402;
    map.getPane('pane_Forest_2').style['mix-blend-mode'] = 'normal';
    var layer_Forest_2 = new L.geoJson(json_Forest_2, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Forest_2',
        layerName: 'layer_Forest_2',
        pane: 'pane_Forest_2',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Forest_2',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(133,182,111,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Forest_2);
    map.addLayer(layer_Forest_2);
    layersMap.Forest_2 = layer_Forest_2;

    // Maseno_University_3
    map.createPane('pane_Maseno_University_3');
    map.getPane('pane_Maseno_University_3').style.zIndex = 403;
    map.getPane('pane_Maseno_University_3').style['mix-blend-mode'] = 'normal';
    var layer_Maseno_University_3 = new L.geoJson(json_Maseno_University_3, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Maseno_University_3',
        layerName: 'layer_Maseno_University_3',
        pane: 'pane_Maseno_University_3',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Maseno_University_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(164,214,83,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Maseno_University_3);
    map.addLayer(layer_Maseno_University_3);
    layersMap.Maseno_University_3 = layer_Maseno_University_3;

    // Forests_4
    map.createPane('pane_Forests_4');
    map.getPane('pane_Forests_4').style.zIndex = 404;
    map.getPane('pane_Forests_4').style['mix-blend-mode'] = 'normal';
    var layer_Forests_4 = new L.geoJson(json_Forests_4, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Forests_4',
        layerName: 'layer_Forests_4',
        pane: 'pane_Forests_4',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Forests_4',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(255,158,23,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Forests_4);
    map.addLayer(layer_Forests_4);
    layersMap.Forests_4 = layer_Forests_4;

    // Fields_5
    map.createPane('pane_Fields_5');
    map.getPane('pane_Fields_5').style.zIndex = 405;
    map.getPane('pane_Fields_5').style['mix-blend-mode'] = 'normal';
    var layer_Fields_5 = new L.geoJson(json_Fields_5, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Fields_5',
        layerName: 'layer_Fields_5',
        pane: 'pane_Fields_5',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Fields_5',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(243,166,178,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Fields_5);
    map.addLayer(layer_Fields_5);
    layersMap.Fields_5 = layer_Fields_5;

    // Niles_6
    map.createPane('pane_Niles_6');
    map.getPane('pane_Niles_6').style.zIndex = 406;
    map.getPane('pane_Niles_6').style['mix-blend-mode'] = 'normal';
    var layer_Niles_6 = new L.geoJson(json_Niles_6, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Niles_6',
        layerName: 'layer_Niles_6',
        pane: 'pane_Niles_6',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Niles_6',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(225,89,137,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Niles_6);
    map.addLayer(layer_Niles_6);
    layersMap.Niles_6 = layer_Niles_6;

    // College_Campus_7
    map.createPane('pane_College_Campus_7');
    map.getPane('pane_College_Campus_7').style.zIndex = 407;
    map.getPane('pane_College_Campus_7').style['mix-blend-mode'] = 'normal';
    var layer_College_Campus_7 = new L.geoJson(json_College_Campus_7, {
        attribution: '',
        interactive: true,
        dataVar: 'json_College_Campus_7',
        layerName: 'layer_College_Campus_7',
        pane: 'pane_College_Campus_7',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_College_Campus_7',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(213,180,60,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_College_Campus_7);
    map.addLayer(layer_College_Campus_7);
    layersMap.College_Campus_7 = layer_College_Campus_7;

    // Siriba_8
    map.createPane('pane_Siriba_8');
    map.getPane('pane_Siriba_8').style.zIndex = 408;
    map.getPane('pane_Siriba_8').style['mix-blend-mode'] = 'normal';
    var layer_Siriba_8 = new L.geoJson(json_Siriba_8, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Siriba_8',
        layerName: 'layer_Siriba_8',
        pane: 'pane_Siriba_8',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Siriba_8',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(141,90,153,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Siriba_8);
    map.addLayer(layer_Siriba_8);
    layersMap.Siriba_8 = layer_Siriba_8;

    // Niles_bldngs_9
    map.createPane('pane_Niles_bldngs_9');
    map.getPane('pane_Niles_bldngs_9').style.zIndex = 409;
    map.getPane('pane_Niles_bldngs_9').style['mix-blend-mode'] = 'normal';
    var layer_Niles_bldngs_9 = new L.geoJson(json_Niles_bldngs_9, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Niles_bldngs_9',
        layerName: 'layer_Niles_bldngs_9',
        pane: 'pane_Niles_bldngs_9',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Niles_bldngs_9',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(190,178,151,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Niles_bldngs_9);
    map.addLayer(layer_Niles_bldngs_9);
    layersMap.Niles_bldngs_9 = layer_Niles_bldngs_9;

    // Siriba_bldngs_10
    map.createPane('pane_Siriba_bldngs_10');
    map.getPane('pane_Siriba_bldngs_10').style.zIndex = 410;
    map.getPane('pane_Siriba_bldngs_10').style['mix-blend-mode'] = 'normal';
    var layer_Siriba_bldngs_10 = new L.geoJson(json_Siriba_bldngs_10, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Siriba_bldngs_10',
        layerName: 'layer_Siriba_bldngs_10',
        pane: 'pane_Siriba_bldngs_10',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_Siriba_bldngs_10',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(196,60,57,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_Siriba_bldngs_10);
    map.addLayer(layer_Siriba_bldngs_10);
    layersMap.Siriba_bldngs_10 = layer_Siriba_bldngs_10;

    // CC_bldngs_11
    map.createPane('pane_CC_bldngs_11');
    map.getPane('pane_CC_bldngs_11').style.zIndex = 411;
    map.getPane('pane_CC_bldngs_11').style['mix-blend-mode'] = 'normal';
    var layer_CC_bldngs_11 = new L.geoJson(json_CC_bldngs_11, {
        attribution: '',
        interactive: true,
        dataVar: 'json_CC_bldngs_11',
        layerName: 'layer_CC_bldngs_11',
        pane: 'pane_CC_bldngs_11',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_CC_bldngs_11',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(141,90,153,1.0)',
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_CC_bldngs_11);
    map.addLayer(layer_CC_bldngs_11);
    layersMap.CC_bldngs_11 = layer_CC_bldngs_11;

    // MasenoRoads_12
    map.createPane('pane_MasenoRoads_12');
    map.getPane('pane_MasenoRoads_12').style.zIndex = 412;
    map.getPane('pane_MasenoRoads_12').style['mix-blend-mode'] = 'normal';
    var layer_MasenoRoads_12 = new L.geoJson(json_MasenoRoads_12, {
        attribution: '',
        interactive: true,
        dataVar: 'json_MasenoRoads_12',
        layerName: 'layer_MasenoRoads_12',
        pane: 'pane_MasenoRoads_12',
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    for (var i in e.target._eventParents) {
                        if (typeof e.target._eventParents[i].resetStyle === 'function') {
                            e.target._eventParents[i].resetStyle(e.target);
                        }
                    }
                },
                mouseover: highlightFeature,
            });
            layer.bindPopup(removeEmptyRowsFromPopupContent('<table></table>', feature), { maxHeight: 400 });
        },
        style: function() {
            return {
                pane: 'pane_MasenoRoads_12',
                opacity: 1,
                color: 'rgba(30,41,25,1.0)',
                dashArray: '',
                lineCap: 'square',
                lineJoin: 'bevel',
                weight: 4.0,
                fillOpacity: 0,
                interactive: true,
            }
        },
    });
    bounds_group.addLayer(layer_MasenoRoads_12);
    map.addLayer(layer_MasenoRoads_12);
    layersMap.MasenoRoads_12 = layer_MasenoRoads_12;

    console.log('✅ QGIS2Web layers initialized with correct symbology');
    return layersMap;
}
