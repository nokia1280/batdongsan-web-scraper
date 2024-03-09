// Append SVG to the body
const svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Load data from JSON file
d3.json("counts.json")
    .then(function (data) {
        // Convert the data object into an array of objects
        const dataArray = Object.entries(data).map(([date, counts]) => ({
            Date: d3.timeParse("%d/%m/%Y")(date),
            House: counts.House || 0,
            Villa: counts.Villa || 0,
            Apartment: counts.Apartment || 0,
            Shophouse: counts.Shophouse || 0
        }));

        dataArray.sort((a, b) => a.Date - b.Date)

        // Define stack generator
        const stack = d3.stack()
            .keys(["House", "Villa", "Apartment", "Shophouse"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        // Stack the data
        const stackedData = stack(dataArray);

        // Set up scales for x and y axes
        const x = d3.scaleBand()
            .domain(dataArray.map(d => d3.timeFormat("%d/%m")(d.Date)))
            .range([margin.left, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
            .nice()
            .range([height, margin.top]);

        // Draw bars
        svg2.selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", (d, i) => ["steelblue", "green", "orange", "red"][i])
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", (d, i) => x(d3.timeFormat("%d/%m")(dataArray[i].Date)))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .on("mouseover", function (event, d) {
                const houseType = d3.select(this.parentNode).datum().key;
                const count = d[1] - d[0];
                tooltip.style("opacity", 1)
                    .html(`${houseType}: ${count}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });

        // Add x axis
        svg2.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Add y axis
        svg2.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));

        // Add x axis label
        svg2.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
            .style("text-anchor", "middle")
            .text("Date");

        // Add y axis label
        svg2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left / 10)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Posts");

        // Add legend
        const legend = svg2.append("g")
            .attr("transform", `translate(${margin.left}, ${height + margin.top + 40})`) // Adjust translation here
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(["House", "Villa", "Apartment", "Shophouse"].slice())
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${i * 100}, 0)`); // Adjust translation here

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", (d, i) => ["steelblue", "green", "orange", "red"][i]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);

        // Add tooltip
        const tooltip = d3.select("#chart2")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    })
    .catch(function (error) {
        console.error('Error loading data:', error);
    });
