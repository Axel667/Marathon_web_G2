// Chargement des données
d3.json('data_clustering.json').then(function(data) {
    // Initialisation des sélecteurs pour les axes
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
    d3.select("#x-axis").selectAll('option')
      .data(keys).enter()
      .append('option')
      .text(d => d)
      .property("selected", function(d, i) { return i === 0; }); // Sélection par défaut pour l'axe X

    d3.select("#y-axis").selectAll('option')
      .data(keys).enter()
      .append('option')
      .text(d => d)
      .property("selected", function(d, i) { return i === 1; }); // Sélection par défaut pour l'axe Y

    // Configuration initiale des axes
    let xValue = keys[0];
    let yValue = keys[1];

    // Création du nuage de points
    const margin = { top: 10, right: 150, bottom: 40, left: 80 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
                     .range([0, width]);
    const yScale = d3.scaleLinear()
                     .range([height, 0]);

    const xAxis = svg.append("g")
                     .attr("transform", "translate(0," + height + ")")
                     .attr("class", "axis");
    const yAxis = svg.append("g")
                     .attr("class", "axis");

    const xAxisLabel = svg.append("text")
                          .attr("transform", "translate(" + (width/2) + " ," + (height + margin.bottom - 10) + ")")
                          .style("text-anchor", "middle")
                          .text(xValue);
    const yAxisLabel = svg.append("text")
                          .attr("transform", "rotate(-90)")
                          .attr("y", 0 - margin.left + 30)
                          .attr("x", 0 - (height / 2))
                          .attr("dy", "1em")
                          .style("text-anchor", "middle")
                          .text(yValue);

    // Mise à jour de l'échelle de couleurs avec la nouvelle couleur pour le cluster 5
    const colorScale = d3.scaleOrdinal()
                         .domain(Array.from(new Set(data.map(d => d.Cluster))))
                         .range(["#d14816", "#e97804", "#8ecae6", "#2984ce", "#fab613"]);

    // Mise à jour du graphique
    function updateGraph() {
        xScale.domain([0, d3.max(data, d => d[xValue])]);
        yScale.domain([0, d3.max(data, d => d[yValue])]);

        xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

        xAxisLabel.text(xValue);
        yAxisLabel.text(yValue);

        const circles = svg.selectAll("circle")
                           .data(data);

        circles.enter().append("circle")
               .merge(circles)
               .transition()
               .duration(1000)
               .attr("cx", d => xScale(d[xValue]))
               .attr("cy", d => yScale(d[yValue]))
               .attr("r", 5)
               .attr("fill", d => colorScale(d.Cluster));

        circles.exit().remove();
    }

    // Ajout de la légende pour les clusters
    const legend = svg.append("g")
                      .attr("transform", "translate(" + (width + margin.left) + ",20)");

    colorScale.domain().forEach(function(cluster, index) {
        const legendRow = legend.append("g")
                                .attr("transform", "translate(0, " + (index * 20) + ")");
        
        legendRow.append("rect")
                 .attr("width", 10)
                 .attr("height", 10)
                 .attr("fill", colorScale(cluster));

        legendRow.append("text")
                 .attr("x", 20)
                 .attr("y", 10)
                 .text("Cluster " + (cluster + 1)); // Affichage du numéro de cluster correct
    });

    // Écouteurs d'événements pour la sélection des axes
    d3.select("#x-axis").on("change", function() {
        xValue = this.value;
        updateGraph();
    });

    d3.select("#y-axis").on("change", function() {
        yValue = this.value;
        updateGraph();
    });

    // Premier affichage du graphique
    updateGraph();

}).catch(function(error) {
    console.log(error);
});
