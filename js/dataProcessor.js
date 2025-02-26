const dataProcessor = {
    /**
     * Process country data based on selected option
     * @param {Array} countriesData - Raw country data
     * @param {String} selectedOption - Selected visualization option
     * @returns {Array} - Processed data for visualization
     */
    processData: function(countriesData, selectedOption) {
        if (!countriesData || !Array.isArray(countriesData)) {
            return [];
        }
        
        try {
            let processedData;
            
            switch (selectedOption) {
                case 'population':
                    processedData = this.processCountryData(countriesData, country => ({
                        id: country.alpha3Code,
                        name: country.name,
                        value: country.population,
                        region: country.region,
                        metric: 'Population',
                        country: country
                    }));
                    break;
                    
                case 'borders':
                    processedData = this.processCountryData(countriesData, country => ({
                        id: country.alpha3Code,
                        name: country.name,
                        value: country.borders ? country.borders.length : 0,
                        region: country.region,
                        metric: 'Number of borders',
                        country: country
                    }));
                    break;
                    
                case 'timezones':
                    processedData = this.processCountryData(countriesData, country => ({
                        id: country.alpha3Code,
                        name: country.name,
                        value: country.timezones ? country.timezones.length : 0,
                        region: country.region,
                        metric: 'Number of timezones',
                        country: country
                    }));
                    break;
                    
                case 'languages':
                    processedData = this.processCountryData(countriesData, country => ({
                        id: country.alpha3Code,
                        name: country.name,
                        value: country.languages ? country.languages.length : 0,
                        region: country.region,
                        metric: 'Number of languages',
                        country: country
                    }));
                    break;
                    
                case 'regionCountries':
                    processedData = this.processRegionData(countriesData, 
                        region => countriesData.filter(country => country.region === region).length,
                        'Number of countries'
                    );
                    break;
                    
                case 'regionTimezones':
                    processedData = this.processRegionData(countriesData, 
                        region => {
                            const countriesInRegion = countriesData.filter(country => country.region === region);
                            const uniqueTimezones = new Set();
                            
                            countriesInRegion.forEach(country => {
                                if (country.timezones) {
                                    country.timezones.forEach(timezone => uniqueTimezones.add(timezone));
                                }
                            });
                            
                            return uniqueTimezones.size;
                        },
                        'Number of unique timezones'
                    );
                    break;
                    
                default:
                    throw new Error(`Unknown plot option: ${selectedOption}`);
            }
            
            return processedData;
        } catch (error) {
            console.error('Error processing data:', error);
            return [];
        }
    },
    
    /**
     * Process country-based data
     * @param {Array} countriesData - Raw country data
     * @param {Function} extractorFn - Function to extract relevant data from each country
     * @returns {Array} - Processed data array
     */
    processCountryData: function(countriesData, extractorFn) {
        return countriesData
            .filter(country => country.name && country.region)
            .map(extractorFn)
            .sort((a, b) => b.value - a.value); // Sort by value descending
    },
    
    /**
     * Process region-based data
     * @param {Array} countriesData - Raw country data
     * @param {Function} valueFn - Function to calculate the value for each region
     * @param {String} metricName - Name of the metric being calculated
     * @returns {Array} - Processed region data array
     */
    processRegionData: function(countriesData, valueFn, metricName) {
        const regions = [...new Set(countriesData
            .filter(country => country.region)
            .map(country => country.region))];
        
        return regions.map(region => {
            const value = valueFn(region);
            const countriesInRegion = countriesData.filter(country => country.region === region);
            return {
                id: region,
                name: region,
                value: value,
                region: region,
                metric: metricName,
                countriesInRegion: countriesInRegion
            };
        }).sort((a, b) => b.value - a.value);
    },
    
    /**
     * Get a consistent color for a region
     * @param {Array} countriesData - Raw country data
     * @param {String} region - Region name
     * @returns {String} - Color code
     */
    getColorForRegion: function(countriesData, region) {
        const uniqueRegions = [...new Set(countriesData.map(c => c.region))];
        const regionIndex = uniqueRegions.indexOf(region);
        return config.colorScheme[regionIndex % config.colorScheme.length];
    }
};