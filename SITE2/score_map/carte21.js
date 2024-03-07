document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('carte', {
        minZoom: 9,
        maxZoom: 30,
    }).setView([43.1833, 2.3491], 10);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
                     '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    var geojsonLayer;

    Promise.all([
        d3.json("communes-11-aude.geojson"),
        d3.json("data_calculator.json") // Assurez-vous que le chemin d'accès est correct
    ]).then(function(datasets) {
        var geoJsonData = datasets[0];
        var scoresData = datasets[1];

        // Initialisation de la couche GeoJSON avec des popups basées sur les scores initiaux
        geojsonLayer = L.geoJson(geoJsonData, {
            style: function(feature) {
                var scoreEntry = scoresData.find(item => item.Libellé === feature.properties.nom);
                return {
                    fillColor: getScoreColor(scoreEntry ? scoreEntry.Score : 0),
                    color: "white",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                var scoreEntry = scoresData.find(item => item.Libellé === feature.properties.nom);
                // Initialiser la popup avec le nom de la commune et le score
                var popupContent = `Commune: ${feature.properties.nom}<br>Score: ${scoreEntry ? scoreEntry.Score.toFixed(2) : "N/A"}`;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);

        // Fonction pour mettre à jour les couleurs et le texte des popups
window.updateMapColors = function(updatedScoresData) {
    geojsonLayer.eachLayer(function(layer) {
        var scoreEntry = updatedScoresData.find(item => item.Libellé === layer.feature.properties.nom);
        var newColor = getScoreColor(scoreEntry ? scoreEntry.Score : 0);
        // Mettre à jour le contenu de la popup avec le nom de la commune et le nouveau score
        var newPopupContent = `Commune: ${layer.feature.properties.nom}<br>Score: ${scoreEntry ? scoreEntry.Score.toFixed(2) : "N/A"}`;
        layer.setStyle({
            fillColor: newColor
        });
        layer.setPopupContent(newPopupContent);
    });
};
    }).catch(function(error) {
        console.error('Error loading the data:', error);
    });

    function getScoreColor(score) {
        // Adaptez cette fonction pour correspondre à votre logique de score
        return score > 0.8 ? "#006837" :
               score > 0.6 ? "#31a354" :
               score > 0.4 ? "#78c679" :
               score > 0.2 ? "#c2e699" :
                             "#ffffcc";
    }
});

