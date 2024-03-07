document.addEventListener('DOMContentLoaded', function() {
    d3.json('data_calculator.json').then(function(data) {
        initializeCalculator(data);
    }).catch(function(error) {
        console.error('Error loading the JSON data: ', error);
    });
});

function initializeCalculator(data) {
    const libelleSelect = d3.select('#libelleSelect');
    const optionsDiv = d3.select('#options');
    const scoreDiv = d3.select('#calculateur').append('div').attr('id', 'score2');

    libelleSelect.selectAll('option')
        .data(data)
        .enter()
        .append('option')
        .text(d => d.Libellé);

    libelleSelect.on('change', function() {
        updateOptions(this.value);
    });

    function updateOptions(selectedLibelle) {
        optionsDiv.html('');
        const selectedData = data.find(d => d.Libellé === selectedLibelle);

        for (const key in selectedData) {
            if (key !== 'Libellé' && key !== 'Score') {
                let columnDiv = optionsDiv.append('div').classed('column', true);
                columnDiv.append('span')
                    .text(key)
                    .classed('label', true);

                let slider = columnDiv.append('input')
                    .attr('type', 'range')
                    .attr('min', '0')
                    .attr('max', '5')
                    .attr('value', '1')
                    .attr('step', '0.01');
                
                slider.on('input', updateScore);
            }
        }
        updateScore(); // Calculer le Score 2 initialement
    }

    function updateScore() {
        let sum = 0;
        let count = 0;
        const selectedData = data.find(d => d.Libellé === libelleSelect.node().value);
    
        optionsDiv.selectAll('input[type=range]').each(function() {
            const slider = d3.select(this);
            const key = slider.node().parentNode.firstChild.textContent;
            const sliderValue = parseFloat(slider.node().value);
            const result = selectedData[key] * sliderValue;
            sum += result;
            count++;
        });
    
        let score = sum / count;
        scoreDiv.text('Score: ' + score.toFixed(6));
    }

    updateOptions(data[0].Libellé); // Initialiser avec le premier élément
}
