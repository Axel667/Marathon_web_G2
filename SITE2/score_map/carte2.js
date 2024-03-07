document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('divmap', {
        minZoom: 9,
        maxZoom: 30,
    }).setView([43.1833, 2.3491], 10);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
                     '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    function getDensityColor(d) {
        return d > 1000 ? "#800026" :
               d > 500  ? "#BD0026" :
               d > 250  ? "#E31A1C" :
               d > 100  ? "#FC4E2A" :
               d > 50   ? "#FD8D3C" :
               d > 20   ? "#FEB24C" :
               d > 10   ? "#FED976" :
                          "#FFEDA0";
    }

    function style(feature) {
        return {
            fillColor: getDensityColor(feature.properties["Population"]),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.9
        };
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        layer.bindPopup("Population: " + layer.feature.properties.Population).openPopup();
        geojsonLayer.eachLayer(function(otherLayer) {
            if (layer !== otherLayer) {
                otherLayer.setStyle({ fillOpacity: 0.3 });
            }
        });
    }

    function resetHighlight(e) {
        geojsonLayer.resetStyle(e.target);
        geojsonLayer.eachLayer(function(layer) {
            layer.setStyle({ fillOpacity: 0.7 });
        });
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }

    var geojsonLayer;

    $.getJSON("communes-11-aude.geojson", function(geoJsonData) {
        $.getJSON("data.json", function(populationData) {
            populationData.forEach(function(item) {
                var geoFeature = geoJsonData.features.find(function(feature) {
                    return feature.properties.nom === item["Libellé"];
                });
                if (geoFeature) {
                    geoFeature.properties["Population"] = item["Population"];
                    geoFeature.properties["Population"] = item["Population"];
                }
            });

            geojsonLayer = L.geoJson(geoJsonData, {
                style: style,
                onEachFeature: function(feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: function() {
                            // Appel de la fonction de mise en évidence dans visualisation1.js
                            if (window.highlightPointOnGraph) {
                                window.highlightPointOnGraph(feature.properties.nom);
                            }
                        }
                    });
                },
            }).addTo(map);
        });
    });

    window.selectCommuneOnMap = function(communeName) {

        geojsonLayer.eachLayer(function(layer) {
            resetHighlight({target: layer});
        });
        
        geojsonLayer.eachLayer(function(layer) {
            if (layer.feature.properties.nom === communeName) {
                highlightFeature({target: layer});
                // Centrez éventuellement la carte sur la commune sélectionnée
                //map.fitBounds(layer.getBounds());
            }
        });
    };

    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getDensityColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(map);
});
