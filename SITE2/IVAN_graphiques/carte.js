document.addEventListener("DOMContentLoaded", function() {
    // Initialise la carte une fois que le DOM est entièrement chargé
    var map = L.map('divmap').setView([43.1833, 2.3491], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Données de carte © <a href="https://openstreetmap.org">OpenStreetMap</a> contributeurs'
    }).addTo(map);

    // Charge et traite les données JSON pour la population
    $.getJSON("data.json", function(json) {
        var populationData = {};
        json.forEach(function(item) {
            populationData[item["Libellé"]] = item["Population"];
        });

        // Charge et visualise les données GeoJSON pour les communes
        $.getJSON("communes-11-aude.geojson", function(data) {
            L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    var population = populationData[feature.properties.nom];
                    if (population) {
                        layer.bindTooltip(feature.properties.nom + ": " + population + " habitants", {
                            permanent: false, 
                            direction: 'auto'
                        });
                    }
                }
            }).addTo(map);
        }).fail(function() {
            console.log("Erreur lors du chargement du fichier GeoJSON.");
        });
    }).fail(function() {
        console.log("Erreur lors du chargement du fichier JSON pour la population.");
    });
});

