/**
 * Main application entry point
 */
(function() {
    const state = {
        countriesData: null,
        processedData: null,
        selectedOption: 'population',
        isLoading: true,
        error: null
    };
    
    const elements = {
        form: document.getElementById('data-selection-form'),
        chartContainer: document.getElementById('chart-container'),
        errorMessage: document.getElementById('error-message'),
        loadingIndicator: document.querySelector('.loading'),
        plotOptions: document.getElementsByName('plotOption')
    };
    
    /**
     * Initialize the application
     */
    function init() {
        showLoading(true);
        
        elements.form.addEventListener('submit', handleFormSubmit);
        
        for (const option of elements.plotOptions) {
            if (option.checked) {
                state.selectedOption = option.value;
                break;
            }
        }
        
        fetchCountryData();
    }
    
    /**
     * Fetch country data from JSON file
     */
    function fetchCountryData() {
        showLoading(true);
        
        fetch(config.dataUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Successfully loaded data from: ${config.dataUrl}`);
                
                state.countriesData = data;
                
                state.processedData = dataProcessor.processData(data, state.selectedOption);
                
                chartRenderer.createChart(state.processedData, state.countriesData);
                tableRenderer.renderTable(state.processedData);
                
                showLoading(false);
                hideError();
            })
            .catch(error => {
                console.error(`Failed to load data: ${error.message}`);
                showError(`Failed to load country data: ${error.message}`);
                showLoading(false);
            });
    }

    /**
     * Form submit handler
     * @param {Event} event - Form submit event
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        
        for (const option of elements.plotOptions) {
            if (option.checked) {
                state.selectedOption = option.value;
                break;
            }
        }
        
        state.processedData = dataProcessor.processData(state.countriesData, state.selectedOption);
        
        chartRenderer.updateChart(state.processedData, state.countriesData);
        tableRenderer.renderTable(state.processedData);
    }
    
    /**
     * Show loading indicator
     * @param {Boolean} isLoading - Whether the app is loading
     */
    function showLoading(isLoading) {
        state.isLoading = isLoading;
        elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
        elements.chartContainer.style.opacity = isLoading ? '0.5' : '1';
    }
    
    /**
     * Show error message
     * @param {String} message - Error message to display
     */
    function showError(message) {
        state.error = message;
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
    }
    
    /**
     * Hide error message
     */
    function hideError() {
        state.error = null;
        elements.errorMessage.style.display = 'none';
    }
    
    init();
})();