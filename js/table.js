const tableRenderer = {
    /**
     * Render data table
     * @param {Array} data - Processed data for the table
     */
    renderTable: function(data) {
        if (!data || data.length === 0) {
            console.error('No data available for table rendering');
            return;
        }
        
        try {
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = '';
            
            // Update table header based on metric name
            const headerRow = document.querySelector('#data-table thead tr');
            const secondHeader = headerRow.querySelector('th:nth-child(2)');
            secondHeader.textContent = data[0].metric || 'Value';
            
            // Create table rows
            data.forEach(item => {
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = item.name;
                row.appendChild(nameCell);
                
                const valueCell = document.createElement('td');
                valueCell.textContent = item.value.toLocaleString();
                row.appendChild(valueCell);
                
                const regionCell = document.createElement('td');
                regionCell.textContent = item.region;
                row.appendChild(regionCell);
                
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error rendering table:', error);
        }
    }
};