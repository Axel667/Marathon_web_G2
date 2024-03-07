d3.json("data.json").then(function(data) {
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

    const keys = Object.keys(data[0]).filter(k => k !== "Population");
    const selectors = {
        x: d3.select("#x-axis-select").selectAll("option")
            .data(keys).enter().append("option")
            .text(d => d).attr("value", d => d),
        y: d3.select("#y-axis-select").selectAll("option")
            .data(keys).enter().append("option")
            .text(d => d).attr("value", d => d)
    };

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

    function updateChart() {
        svg.selectAll("*").remove();
        const xValue = d3.select("#x-axis-select").node().value;
        const yValue = d3.select("#y-axis-select").node().value;

        const x = d3.scaleLinear().domain([0, d3.max(data, d => +d[xValue])]).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[yValue])]).range([height, 0]);

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

        const circles = svg.selectAll("circle").data(data);
        circles.enter().append("circle")
            .attr("cx", d => x(d[xValue]))
            .attr("cy", d => y(d[yValue]))
            .attr("r", d => Math.sqrt(d["Population"]) * 0.7)
            .style("fill", d => getDensityColor(d["Population"]))
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this)
                  .transition().duration(300)
                  .attr("r", d => Math.sqrt(d["Population"]) * 0.9)
                  .style("stroke", "white").style("stroke-width", 2);
                tooltip.html(d["Libellé"] + ": " + d["Population"])
                       .style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY + 10) + "px")
                       .style("opacity", 1);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                  .transition().duration(300)
                  .attr("r", d => Math.sqrt(d["Population"]) * 0.7)
                  .style("stroke", "none");
                tooltip.style("opacity", 0);
            })
            
            .on("click", function(event, d) {
                var alreadySelected = d3.select(this).classed("selected");
        
        svg.selectAll(".highlight-line").remove(); // Supprime les lignes pointillées

        if (!alreadySelected) {
            svg.selectAll("circle").style("opacity", 0.1).classed("selected", false); // Réinitialise les cercles
            d3.select(this).style("opacity", 1).classed("selected", true); // Sélectionne le cercle cliqué

            let cx = d3.select(this).attr("cx");
            let cy = d3.select(this).attr("cy");
            drawHighlightLines(cx, cy); // Dessine les lignes pointillées

            if (window.selectCommuneOnMap) {
                window.selectCommuneOnMap(d["Libellé"]);
            }
        } else {
            svg.selectAll("circle").style("opacity", 0.7).classed("selected", false); // Désélectionne tout
            if (window.clearMapSelection) {
                window.clearMapSelection(); // Efface la sélection sur la carte si nécessaire
            }
        }
    });


        // Application de la fonctionnalité de zoom à l'ensemble du graphique
        svg.call(zoom);
    }

    // Mise à jour du graphique lors du changement des sélections
    d3.select("#x-axis-select").on("change", updateChart);
    d3.select("#y-axis-select").on("change", updateChart);

    updateChart(); // Dessiner le graphique initialement

    // Définir la fonction de mise en évidence après updateChart
    // Après updateChart();
// Définir la fonction de mise en évidence après updateChart
window.highlightPointOnGraph = function(communeNom) {
    // Déterminer si le cercle était déjà sélectionné
    var alreadySelected = !svg.selectAll(".highlight-line").empty();

    svg.selectAll(".highlight-line").remove(); // Supprime les lignes pointillées

    if (alreadySelected) {
        // Si déjà sélectionné, réinitialiser l'état de tous les cercles
        svg.selectAll("circle")
            .style("opacity", 0.7); // Rétablit l'opacité pour tous les cercles
    } else {
        // Si pas déjà sélectionné, procéder à la mise en évidence du cercle sélectionné
        svg.selectAll("circle")
            .style("opacity", 0.1); // Réduit l'opacité des autres cercles

        // Mettre en évidence seulement le cercle correspondant au nom de la commune
        svg.selectAll("circle")
            .filter(function(d) { return d.Libellé === communeNom; })
            .style("opacity", 1) // Rétablit l'opacité pour le cercle sélectionné
            .each(function(d) {
                let cx = d3.select(this).attr("cx");
                let cy = d3.select(this).attr("cy");
                drawHighlightLines(cx, cy); // Dessine les lignes pointillées pour le cercle sélectionné
            });
    }
};



// La fonction drawHighlightLines reste inchangée


function drawHighlightLines(cx, cy) {
    // Ligne pointillée vers l'axe X
    svg.append("line")
        .attr("class", "highlight-line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", cx)
        .attr("y2", height)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5");

    // Ligne pointillée vers l'axe Y
    svg.append("line")
        .attr("class", "highlight-line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", 0)
        .attr("y2", cy)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5");
}

});