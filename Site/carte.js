 // Initialize the map
 var map = L.map('divmap').setView([43.1833, 2.3491], 10);

 // Add a tile layer to the map
 L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
         '&copy; <a href="https://carto.com/attributions">CARTO</a>',
     maxZoom: 18,
 }).addTo(map);

 // Load and process JSON data
 var populationData;
 $.getJSON("data/data.json", function(json) {
     populationData = {};
     json.forEach(function(item) {
         populationData[item["Libellé"]] = item["Population"];
     });

     // Load and visualize GeoJSON
     $.getJSON("data/communes-11-aude.geojson", function(data) {
         L.geoJson(data, {
             onEachFeature: function (feature, layer) {
                 var population = populationData[feature.properties.nom];
                 if (population) {
                     layer.bindTooltip(`${feature.properties.nom}: ${population} habitants`, {permanent: false, direction: 'auto'});
                 }
             }
         }).addTo(map);
     });
 });