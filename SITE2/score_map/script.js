document.addEventListener('DOMContentLoaded', function() {
    d3.json('data_calculator.json').then(function(data) {
        initializeCalculator(data);
    }).catch(function(error) {
        console.error('Error loading the JSON data: ', error);
    });
});

function initializeCalculator(data) {
    const slidersDiv = d3.select('#sliders');
    const tableBody = d3.select('#classement tbody');
    let coefficients = {};

    // Initialiser les curseurs et les labels de coefficient
    const firstDataEntry = data[0];
    for (const key in firstDataEntry) {
        if (key !== 'Libellé' && key !== 'Score') {
            let sliderContainer = slidersDiv.append('div').classed('slider-container', true);
            sliderContainer.append('label').text(key);
            
            let slider = sliderContainer.append('input')
                .attr('type', 'range')
                .attr('min', '0')
                .attr('max', '5')
                .attr('value', '1')
                .attr('step', '1');

            let coefficientDisplay = sliderContainer.append('span').text(' Coefficient: 1');
            
            slider.on('input', function() {
                coefficients[key] = +this.value;
                coefficientDisplay.text(` Coefficient: ${this.value}`);
                updateScores();
            });

            coefficients[key] = 1; // Valeur initiale
        }
    }

    function updateScores() {
        const totalCoefficient = Object.values(coefficients).reduce((a, b) => a + b, 0);

        let scoredData = data.map(d => {
            let weightedSum = 0;
            for (const key in coefficients) {
                weightedSum += d[key] * coefficients[key];
            }
            let normalizedScore = weightedSum / totalCoefficient;
            return { 'Libellé': d.Libellé, 'Score': normalizedScore };
        });

        // Trier les données par score
        scoredData.sort((a, b) => b.Score - a.Score);

        // Mettre à jour le tableau
        tableBody.selectAll('tr').remove();
        tableBody.selectAll('tr')
            .data(scoredData)
            .enter()
            .append('tr')
            .html(d => `<td>${d.Libellé}</td><td>${d.Score.toFixed(6)}</td>`);

        // Mise à jour des statistiques
        updateStatistics(scoredData);

        // Mise à jour des couleurs sur la carte en fonction des nouveaux scores
        if (window.updateMapColors) {
            window.updateMapColors(scoredData);
        }
    }

    function updateStatistics(scoredData) {
        const scores = scoredData.map(d => d.Score);
        const maxScoreData = scoredData[scores.indexOf(Math.max(...scores))];
        const minScoreData = scoredData[scores.indexOf(Math.min(...scores))];
        const medianScoreData = calculateStatistic(scoredData, 50);
        const firstQuartileData = calculateStatistic(scoredData, 25);
        const thirdQuartileData = calculateStatistic(scoredData, 75);

        d3.select("#maxScore").text(`Score Max: ${maxScoreData.Score.toFixed(6)} (${maxScoreData.Libellé})`);
        d3.select("#minScore").text(`Score Min: ${minScoreData.Score.toFixed(6)} (${minScoreData.Libellé})`);
        d3.select("#medianScore").text(`Score Médian: ${medianScoreData.Score.toFixed(6)} (${medianScoreData.Libellé})`);
        d3.select("#firstQuartile").text(`Premier Quartile: ${firstQuartileData.Score.toFixed(6)} (${firstQuartileData.Libellé})`);
        d3.select("#thirdQuartile").text(`Troisième Quartile: ${thirdQuartileData.Score.toFixed(6)} (${thirdQuartileData.Libellé})`);
    }

    function calculateStatistic(scoredData, percentile) {
        const index = Math.floor(scoredData.length * percentile / 100);
        return scoredData[index];
    }

    updateScores(); // Mise à jour initiale des scores
}
