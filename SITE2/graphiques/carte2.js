document.addEventListener("DOMContentLoaded", function () {
  var map = L.map("divmap", {
    minZoom: 9,
    maxZoom: 30,
  }).setView([43.1833, 2.6491], 9)

  L.tileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }
  ).addTo(map)

  function getDensityColor(d) {
    return d > 1000
      ? "#800026"
      : d > 500
      ? "#BD0026"
      : d > 250
      ? "#E31A1C"
      : d > 100
      ? "#FC4E2A"
      : d > 50
      ? "#FD8D3C"
      : d > 20
      ? "#FEB24C"
      : d > 10
      ? "#FED976"
      : "#FFEDA0"
  }

  function style(feature) {
    return {
      fillColor: getDensityColor(feature.properties["Population"]),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.9,
    }
  }

  function highlightFeature(e) {
    var layer = e.target
    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7,
    })
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront()
    }
    layer
      .bindPopup(
        "Commune: " +
          layer.feature.properties.nom +
          "<br>Population: " +
          layer.feature.properties.Population
      )
      .openPopup()
    geojsonLayer.eachLayer(function (otherLayer) {
      if (layer !== otherLayer) {
        otherLayer.setStyle({ fillOpacity: 0.3 })
      }
    })
  }

  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target)
    geojsonLayer.eachLayer(function (layer) {
      layer.setStyle({ fillOpacity: 0.7 })
    })
  }
  window.highlightPointOnGraph = function (communeName) {
    // Reset the opacity for all bubbles to a dimmed state
    svg.selectAll("circle").style("opacity", 0.1).classed("selected", false) // Ensure to remove any previous selection

    // Find and highlight the corresponding bubble
    svg
      .selectAll("circle")
      .filter(function (d) {
        return d.Libellé === communeName
      })
      .classed("selected", true) // Mark the bubble as selected
      .style("opacity", 1)
      .each(function (d) {
        // Assuming cx and cy can be derived from the bubble's data or position
        let cx = d3v7.select(this).attr("cx")
        let cy = d3v7.select(this).attr("cy")
        drawHighlightLines(cx, cy) // Function to draw red lines towards axes
      })

    // Optional: Update the radar chart with the new selection
    if (window.updateRadarChart) {
      window.updateRadarChart(communeName)
    }
  }

  window.selectCommuneOnMap = function (communeName) {
    geojsonLayer.eachLayer(function (layer) {
      resetHighlight({ target: layer })

      if (layer.feature.properties.nom === communeName) {
        highlightFeature({ target: layer })
        // Optionally center the map on the selected commune
        // map.fitBounds(layer.getBounds())

        // Call updateRadarChart when a commune is selected
        if (window.updateRadarChart) {
          window.updateRadarChart(communeName)
        }
        // Highlight the corresponding bubble on the bubble chart
        if (window.highlightPointOnGraph) {
          window.highlightPointOnGraph(communeName)
        }
      }
    })
  }

  // Assuming this is inside your setup for the map layer
  Promise.all([
    fetch("communes-11-aude.geojson").then(res => res.json()),
    fetch("data.json").then(res => res.json()), // Assuming 'data.json' is accessible via fetch
  ])
    .then(([geoJsonData, populationData]) => {
      // Merge population data into geoJsonData here
      populationData.forEach(item => {
        let geoFeature = geoJsonData.features.find(
          feature => feature.properties.nom === item["Libellé"]
        )
        if (geoFeature) {
          geoFeature.properties["Population"] = item["Population"]
        }
      })

      // Now that geoJsonData has population data merged, initialize the map layer
      geojsonLayer = L.geoJson(geoJsonData, {
        style: style,
        onEachFeature: function (feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: function (e) {
              var communeName = e.target.feature.properties.nom
              window.selectCommuneOnMap(communeName) // This should now also correctly update the radar chart
            },
          })
        },
      }).addTo(map)
    })
    .catch(error => console.error("Error loading data:", error))
  /////////////////
  ////////////////

  ///////////////

  ///////////////
  ///////////////
  ///////////////

  //////////////
  var legend = L.control({ position: "bottomright" })

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = []
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getDensityColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+")
    }
    return div
  }

  legend.addTo(map)
})
