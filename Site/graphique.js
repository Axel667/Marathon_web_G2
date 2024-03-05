// Charger les données
d3.json("../Data/Data-2.json").then(function(data) {
    const margin = {top: 40, right: 20, bottom: 70, left: 80},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // Élimination de 'Densité de population' des sélecteurs
    const keys = Object.keys(data[0]).filter(k => k !== "Densité de population 2020");

    // Initialiser les sélecteurs
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

        // Échelles
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[xValue])])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[yValue])])
            .range([height, 0]);

        // Ajouter les axes
        svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));
        svg.append("g").call(d3.axisLeft(y));

        // Titres des axes
        svg.append("text").attr("text-anchor", "end").attr("x", width/2).attr("y", height + margin.top + 20).text(xValue);
        svg.append("text").attr("text-anchor", "end").attr("transform", "rotate(-90)").attr("y", -margin.left + 20).attr("x", -height/2).text(yValue);

        // Points
        svg.selectAll("dot").data(data).enter().append("circle")
            .attr("cx", d => x(d[xValue])).attr("cy", d => y(d[yValue]))
            .attr("r", 5).style("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                tooltip.html(d["Libellé"]) // Afficher le libellé
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
                    .style("opacity", 1);
            })
            .on("mouseout", function() { tooltip.style("opacity", 0); });
    }

    // Mise à jour du graphique lors du changement des sélections
    d3.select("#x-axis-select").on("change", updateChart);
    d3.select("#y-axis-select").on("change", updateChart);

    updateChart(); // Afficher le graphique initialement
});