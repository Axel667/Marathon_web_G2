d3.json("donnees-convert.json").then(function(data) {
    const margin = {top: 40, right: 20, bottom: 70, left: 100},
          width = 1100 - margin.left - margin.right,
          height = 700 - margin.top - margin.bottom;
          
    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    const keys = Object.keys(data[0]).filter(k => k !== "Densité de population 2020");
    const selectors = {
        x: d3.select("#x-axis-select").selectAll("option")
            .data(keys).enter().append("option")
            .text(d => d).attr("value", d => d),
        y: d3.select("#y-axis-select").selectAll("option")
            .data(keys).enter().append("option")
            .text(d => d).attr("value", d => d)
    };

    function updateChart() {
        svg.selectAll("*").remove();
        const xValue = d3.select("#x-axis-select").node().value;
        const yValue = d3.select("#y-axis-select").node().value;

        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[xValue])])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[yValue])])
            .range([height, 0]);

        // Style du quadrillage horizontal
svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .ticks(5)
        .tickSize(-height)
        .tickFormat(""))
    .selectAll(".tick line").style("stroke", "#ddd").style("stroke-opacity", "0.7");

// Style du quadrillage vertical
svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(""))
    .selectAll(".tick line").style("stroke", "#ddd").style("stroke-opacity", "0.7");

        const xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        const yAxis = svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg.append("text").attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height + margin.top + 20)
            .text(xValue);
        svg.append("text").attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 30)
            .attr("x", -height/4)
            .text(yValue);

        // Zoom functionality adjusted to not visually modify the graph
const zoom = d3.zoom()
.scaleExtent([1, 1]) // Limite le zoom à une échelle fixe, essentiellement le désactivant
.translateExtent([[0, 0], [width, height]])
.on("zoom", (event) => {
// Ne fait rien lors du zoom pour ne pas modifier les éléments visuels
// Ce code conserve la structure de callback mais n'applique pas les transformations
});

svg.append("rect")
.attr("width", width)
.attr("height", height)
.style("fill", "none")
.style("pointer-events", "all")
.attr("class", "zoom")
.call(zoom);





        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr("class", "zoom")
            .call(zoom);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        svg.selectAll("circle").data(data)
            .enter().append("circle")
            .attr("cx", d => x(d[xValue]))
            .attr("cy", d => y(d[yValue]))
            .attr("r", d => Math.sqrt(d["Densité de population 2020"]) * 2)
            .style("fill", d => colorScale(d["Libellé"]))
            .style("opacity", 0.3) // Réduction de l'opacité pour améliorer la lisibilité
            .on("mouseover", function(event, d) {
                tooltip.html(d["Libellé"])
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
                    .style("opacity", 1);
            })
            .on("mouseout", function() { tooltip.style("opacity", 0); });

        // Application de la fonctionnalité de zoom à l'ensemble du graphique
        svg.call(zoom);
    }

    // Mise à jour du graphique lors du changement des sélections
    d3.select("#x-axis-select").on("change", updateChart);
    d3.select("#y-axis-select").on("change", updateChart);

    updateChart(); // Dessiner le graphique initialement
});