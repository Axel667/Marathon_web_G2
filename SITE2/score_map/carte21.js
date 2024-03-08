document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('carte', {
        minZoom: 9,
        maxZoom: 30,
    }).setView([43.0833, 2.5491], 9);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
                     '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Initialisation des couleurs de la carte à jaune pour tous les scores à 0
    function getScoreColor(score) {
        return score > 0.8 ? "#006837" :
               score > 0.6 ? "#31a354" :
               score > 0.4 ? "#78c679" :
               score > 0.2 ? "#c2e699" :
                             "#ffffcc";  // Jaune pour scores à 0
    }

    var geojsonLayer;

    Promise.all([
        d3.json("communes-11-aude.geojson"),
        d3.json("data_calculator.json")
    ]).then(function(datasets) {
        var geoJsonData = datasets[0];
        // Initialisez les scores à 0 pour toutes les communes
        geoJsonData.features.forEach(function(feature) {
            feature.properties.Score = 0;  // Assurez-vous que cette propriété correspond à votre structure de données
        });

        geojsonLayer = L.geoJson(geoJsonData, {
            style: function(feature) {
                // Utilisez le score initialisé à 0 pour définir la couleur
                return {
                    fillColor: getScoreColor(feature.properties.Score),
                    color: "white",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                // Utilisez le score de 0 pour initialiser la popup
                layer.bindPopup(`Commune: ${feature.properties.nom}<br>Score: 0`);
            }
        }).addTo(map);

        // Fonction pour mettre à jour les couleurs basées sur les scores mis à jour
        window.updateMapColors = function(updatedScoresData) {
            geojsonLayer.eachLayer(function(layer) {
                var scoreEntry = updatedScoresData.find(item => item.Libellé === layer.feature.properties.nom);
                var newColor = getScoreColor(scoreEntry ? scoreEntry.Score : 0);
                var newPopupContent = `Commune: ${layer.feature.properties.nom}<br>Score: ${scoreEntry ? scoreEntry.Score.toFixed(2) : "N/A"}`;
                layer.setStyle({ fillColor: newColor });
                layer.setPopupContent(newPopupContent);
            });
        };
    }).catch(function(error) {
        console.error('Error loading the data:', error);
    });
});

