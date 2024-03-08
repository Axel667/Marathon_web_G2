d3v7.json("data.json").then(function (data) {
  const margin = { top: 40, right: 20, bottom: 70, left: 100 },
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom
  const svg = d3v7
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

  const tooltip = d3v7.select("body").append("div").attr("class", "tooltip")

  const keys = Object.keys(data[0]).filter(
    k => k !== "Population" && k !== "Code" && k !== "Libellé"
  )
  const selectors = {
    x: d3v7
      .select("#x-axis-select")
      .selectAll("option")
      .data(keys)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d),
    y: d3v7
      .select("#y-axis-select")
      .selectAll("option")
      .data(keys)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d),
  }

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

  function updateChart() {
    svg.selectAll("*").remove()
    const xValue = d3v7.select("#x-axis-select").node().value
    const yValue = d3v7.select("#y-axis-select").node().value

    const x = d3v7
      .scaleLinear()
      .domain([0, d3v7.max(data, d => +d[xValue])])
      .range([0, width])
    const y = d3v7
      .scaleLinear()
      .domain([0, d3v7.max(data, d => +d[yValue])])
      .range([height, 0])

    // Style du quadrillage horizontal
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3v7.axisBottom(x).ticks(5).tickSize(-height).tickFormat(""))
      .selectAll(".tick line")
      .style("stroke", "#ddd")
      .style("stroke-opacity", "0.7")

    // Style du quadrillage vertical
    svg
      .append("g")
      .attr("class", "grid")
      .call(d3v7.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
      .selectAll(".tick line")
      .style("stroke", "#ddd")
      .style("stroke-opacity", "0.7")

    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3v7.axisBottom(x))

    const yAxis = svg.append("g").attr("class", "y-axis").call(d3v7.axisLeft(y))

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 20)
      .text(xValue)
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -height / 4)
      .text(yValue)

    // Zoom functionality adjusted to not visually modify the graph
    const zoom = d3v7
      .zoom()
      .scaleExtent([1, 1]) // Limite le zoom à une échelle fixe, essentiellement le désactivant
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", event => {
        // Ne fait rien lors du zoom pour ne pas modifier les éléments visuels
        // Ce code conserve la structure de callback mais n'applique pas les transformations
      })

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("class", "zoom")
      .call(zoom)

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("class", "zoom")
      .call(zoom)

    const colorScale = d3v7.scaleOrdinal(d3v7.schemeCategory10)

    const circles = svg.selectAll("circle").data(data)
    circles
      .enter()
      .append("circle")
      .attr("cx", d => x(d[xValue]))
      .attr("cy", d => y(d[yValue]))
      .attr("r", d => Math.sqrt(d["Population"]) * 0.3)
      .style("fill", d => getDensityColor(d["Population"]))
      .style("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3v7
          .select(this)
          .transition()
          .duration(300)
          .attr("r", d => Math.sqrt(d["Population"]) * 0.4)
          .style("stroke", "white")
          .style("stroke-width", 2)
        tooltip
          .html(d["Libellé"] + ": " + d["Population"])
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .style("opacity", 1)
      })
      .on("mouseout", function (d) {
        d3v7
          .select(this)
          .transition()
          .duration(300)
          .attr("r", d => Math.sqrt(d["Population"]) * 0.3)
          .style("stroke", "none")
        tooltip.style("opacity", 0)
      })

      .on("click", function (event, d) {
        var alreadySelected = d3v7.select(this).classed("selected")

        svg.selectAll("circle").style("opacity", 0.1).classed("selected", false) // Supprime les lignes pointillées

        if (!alreadySelected) {
          d3v7.select(this).style("opacity", 1).classed("selected", true) // Sélectionne le cercle cliqué

          // Draw highlight lines for the selected bubble
          let cx = d3v7.select(this).attr("cx")
          let cy = d3v7.select(this).attr("cy")
          drawHighlightLines(cx, cy) // Dessine les lignes pointillées

          if (window.selectCommuneOnMap) {
            window.selectCommuneOnMap(d["Libellé"])
          }
          if (window.clearMapSelection) {
            window.clearMapSelection() // Efface la sélection sur la carte si nécessaire
          }
        } else {
          svg.selectAll("circle").style("opacity", 0.7) // Désélectionne tout
        }
      })

    // Application de la fonctionnalité de zoom à l'ensemble du graphique
    svg.call(zoom)
  }

  // Mise à jour du graphique lors du changement des sélections
  d3v7.select("#x-axis-select").on("change", updateChart)
  d3v7.select("#y-axis-select").on("change", updateChart)

  updateChart() // Dessiner le graphique initialement

  // Définir la fonction de mise en évidence après updateChart
  // Après updateChart();
  // Définir la fonction de mise en évidence après updateChart
  window.highlightPointOnGraph = function (communeName) {
    console.log("Highlighting commune:", communeName) // Debugging

    var alreadySelected = !svg.selectAll(".highlight-line").empty()
    console.log("Already selected?", alreadySelected) // Debugging

    svg.selectAll(".highlight-line").remove()

    svg.selectAll("circle").style("opacity", 0.1).classed("selected", false)

    svg
      .selectAll("circle")
      .filter(function (d) {
        console.log("Checking commune:", d.Libellé) // Debugging
        return d.Libellé === communeName
      })
      .style("opacity", 1)
      .classed("selected", true)
      .each(function (d) {
        let cx = d3v7.select(this).attr("cx")
        let cy = d3v7.select(this).attr("cy")
        drawHighlightLines(cx, cy)
      })

    if (!alreadySelected) {
      console.log("No matches found for:", communeName) // If no circles highlighted
    }
  }

  // La fonction drawHighlightLines reste inchangée

  function drawHighlightLines(cx, cy) {
    // Ligne pointillée vers l'axe X
    svg
      .append("line")
      .attr("class", "highlight-line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", cx)
      .attr("y2", height)
      .style("stroke", "red")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "5,5")

    // Ligne pointillée vers l'axe Y
    svg
      .append("line")
      .attr("class", "highlight-line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", 0)
      .attr("y2", cy)
      .style("stroke", "red")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "5,5")
  }
})
