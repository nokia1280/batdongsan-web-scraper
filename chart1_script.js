const svg = d3.select("#chart1")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

const formatPrice = (price) => {
    return price.toFixed(2); // Format the price with two decimal places
};

// Function to update the chart
function updateChart() {
    // Remove the old chart
    svg.selectAll("*").remove();

    // Get the selected location and property type
    var selectedLocation = document.getElementById("location").value;
    var selectedType = document.getElementById("type").value;

    // Load data from JSON file
    d3.json("scraped_data.json")
        .then(function (data) {
            // Filter the data based on the selected location and property type
            var filteredData = data.filter(d => d.location === selectedLocation && d.type === selectedType);

            // Group the data by date and calculate the average price per area
            const groupedData = Array.from(d3.group(filteredData, d => d.time), ([key, value]) => ({ key, value }));
            const averagedData = groupedData.map(d => {
                const validValues = d.value.filter(v => v.price && v.area); // exclude data points where price or area is null or 0
                const avgPricePerArea = d3.mean(validValues, v => v.price / v.area);
                return { date: d3.timeParse("%d/%m/%Y")(d.key), avgPricePerArea: avgPricePerArea };
            });

            // Sort the data by date from oldest to latest
            averagedData.sort((a, b) => a.date - b.date);

            // Set up scales for x and y axes
            const x = d3.scaleTime()
                .domain(d3.extent(averagedData, d => d.date))
                .range([margin.left, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(averagedData, d => d.avgPricePerArea)])
                .nice()
                .range([height, margin.top]);

            // Define the line
            const line = d3.line()
                .defined(d => !isNaN(d.avgPricePerArea))
                .x(d => x(d.date))
                .y(d => y(d.avgPricePerArea));

            // Draw the line
            svg.append("path")
                .datum(averagedData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line);

            // Add x axis
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%m")));

            // Add y axis
            svg.append("g")
                .attr("transform", `translate(${margin.left}, 0)`)
                .call(d3.axisLeft(y));

            // Add x axis label
            svg.append("text")
                .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
                .style("text-anchor", "middle")
                .text("Date");

            // Add y axis label
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", margin.left / 10)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Average Price per Area (billion VND/m2)");

            // Add tooltip
            const tooltip = d3.select("#chart1")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.selectAll("dot")
                .data(averagedData)
                .enter().append("circle")
                .attr("r", 4)
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.avgPricePerArea))
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`<strong>Date:</strong> ${d3.timeFormat("%d/%m/%Y")(d.date)}<br/><strong>Average Price per Area:</strong> ${formatPrice(d.avgPricePerArea)} billion VND/m2`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        })
        .catch(function (error) {
            console.error('Error loading data:', error);
        });
}

// Run the update function when the page loads
updateChart();

// Update the chart whenever the selected option changes
d3.select("#location").on("change", updateChart);
d3.select("#type").on("change", updateChart);