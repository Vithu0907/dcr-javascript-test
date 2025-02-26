/**
 * Chart rendering functionality
 */
const chartRenderer = {
    // Chart state
    chart: null,
    tooltip: null,
    
    /**
     * Create the bubble chart
     * @param {Array} data - Processed data for visualization
     * @param {Array} rawData - Original country data for color mapping
     */
    createChart: function(data, rawData) {
        if (!data || data.length === 0) {
            console.error('No data available for chart creation');
            return;
        }
        
        try {
            d3.select('#chart-container svg').remove();
            
            const svg = d3.select('#chart-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${config.chartWidth} ${config.chartHeight}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
            
            if (!this.tooltip) {
                this.tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);
            }
            
            const radiusScale = d3.scaleSqrt()
                .domain([0, d3.max(data, d => d.value)])
                .range([config.circleMinRadius, config.circleMaxRadius]);
            
            const simulation = d3.forceSimulation(data)
                .force('charge', d3.forceManyBody().strength(5))
                .force('center', d3.forceCenter(config.chartWidth / 2, config.chartHeight / 2))
                .force('collision', d3.forceCollide().radius(d => radiusScale(d.value) + 1))
                .on('tick', ticked);
            
            const circles = svg.selectAll('.bubble')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'bubble')
                .attr('r', d => radiusScale(d.value))
                .attr('fill', d => dataProcessor.getColorForRegion(rawData, d.region))
                .attr('opacity', config.circleOpacity)
                .attr('stroke', '#000')
                .attr('stroke-width', 1)
                .on('mouseover', (event, d) => this.showTooltip(event, d))
                .on('mouseout', () => this.hideTooltip());
            
            // Add labels for only large bubbles else it will be too cluttered
            const labels = svg.selectAll('.label')
                .data(data.filter(d => radiusScale(d.value) > 15))
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', d => Math.min(radiusScale(d.value) / 2, 12))
                .text(d => d.name.length > 10 ? d.name.substring(0, 3) + '...' : d.name);
            
            const valueLabels = svg.selectAll('.value-label')
                .data(data.filter(d => radiusScale(d.value) > 25))
                .enter()
                .append('text')
                .attr('class', 'value-label')
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', d => Math.min(radiusScale(d.value) / 3, 10))
                .attr('dy', '1em')
                .text(d => d.value.toLocaleString());
            
            function ticked() {
                circles
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
                
                labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
                
                valueLabels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
            }
            
            this.chart = {
                svg,
                simulation,
                circles,
                labels,
                valueLabels
            };
            
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    },
    
    /**
     * Show tooltip with extended information
     * @param {Event} event - Mouse event
     * @param {Object} d - Data point
     */
    showTooltip: function(event, d) {
        let tooltipContent = '';
        
        if (d.country) {
            tooltipContent = `
                <strong>${d.name}</strong><br/>
                <strong>${d.metric}:</strong> ${d.value.toLocaleString()}<br/>
                <strong>Region:</strong> ${d.region}<br/>
                <strong>Subregion:</strong> ${d.country.subregion || 'N/A'}<br/>
                <strong>Capital:</strong> ${d.country.capital || 'N/A'}<br/>
                <strong>Area:</strong> ${d.country.area ? d.country.area.toLocaleString() + ' km²' : 'N/A'}<br/>
                <strong>Languages:</strong> ${d.country.languages ? d.country.languages.map(l => l.name).join(', ') : 'N/A'}
            `;
        } else {
            tooltipContent = `
                <strong>${d.name} Region</strong><br/>
                <strong>${d.metric}:</strong> ${d.value.toLocaleString()}<br/>
                <strong>Countries:</strong> ${d.countriesInRegion.length.toLocaleString()}<br/>
                <strong>Total Population:</strong> ${d.countriesInRegion.reduce((sum, c) => sum + c.population, 0).toLocaleString()}
            `;
        }
        
        this.tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
        
        this.tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    },
    
    /**
     * Hide tooltip
     */
    hideTooltip: function() {
        this.tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    },
    
    /**
     * Update chart with new data
     * @param {Array} data - New processed data
     * @param {Array} rawData - Original country data
     */
    updateChart: function(data, rawData) {
        this.createChart(data, rawData);
    }
};