// Function to initialize the dashboard
function init() {
    // Use D3 to fetch the data from the JSON file
    d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json").then(function(data) {

        // Assuming data structure has properties sample_values, otu_ids, and otu_labels
        var sampleValues = data.sample_values;
        var otuIds = data.otu_ids;
        var otuLabels = data.otu_labels;
        var metadata = data.metadata;
        var washingFrequency = data.metadata[0].wfreq;

        // Select the dropdown menu
        var dropdownMenu = d3.select("#selDataset");
        
        // Populate the dropdown menu with sample IDs
        data.names.forEach(function(sample) {
            dropdownMenu.append("option").text(sample).property("value", sample);    
        });

        // Get the initial sample ID
        var initialSample = data.names[0];

        // Call the functions to create the initial horizontal bar chart and metadata panel
        createBarChart(initialSample, sampleValues, otuIds, otuLabels, data);
        createBubbleChart(initialSample, sampleValues, otuIds, otuLabels, data);
        displayMetadata(initialSample, metadata);

        // Call the function to create the gauge chart
        createGaugeChart(washingFrequency);

        // Add event listener to the dropdown menu to update plots on selection change
        dropdownMenu.on("change", function() {
            var selectedSample = this.value;
            // Call the functions to update the charts and metadata for the selected sample
            createBarChart(selectedSample, sampleValues, otuIds, otuLabels, data);
            createBubbleChart(selectedSample, sampleValues, otuIds, otuLabels, data);
            displayMetadata(selectedSample, metadata);
            createGaugeChart(metadata.find(m => m.id === parseInt(selectedSample)).wfreq);
        });
    });
}

// Function to create the horizontal bar chart
function createBarChart(sample, sampleValues, otuIds, otuLabels, data) {
    // Filter data for the selected sample
    var filteredData = data.samples.filter(function(d) {
        return d.id === sample;
    })[0];

    // Check if filteredData is defined
    if (!filteredData) {
        console.error("Filtered data not found for sample:", sample);
    }

    // Slice the top 10 values, reverse to have the highest at the top
    var top10Values = (filteredData.sample_values || []).slice(0,10).reverse();
    var top10Ids = (filteredData.otu_ids || []).slice(0,10).reverse();
    var top10Labels = (filteredData.otuLabels || []).slice(0,10).reverse();

    // Create the trace for the bar chart
    var trace = {
        x: top10Values,
        y: top10Ids.map(id => `OTU ${id}`),
        text: top10Labels,
        type: "bar",
        orientation: "h"
    };

    // Create the data array
    var plotData = [trace];

    // Create the layout for the bar chart
    var layout = {
        title: "Top 10 OTUs present"
    };

    // Plot the bar chart
    Plotly.newPlot("bar", plotData, layout);
}

// Function to create the bubble chart
function createBubbleChart(sample, sampleValues, otuIds, otuLabels, data) {
    // Filter data for the selected sample
    var filteredData = data.samples.filter(function(d) {
        return d.id === sample;
    })[0];

    // Extract relevant data for the bubble chart
    var xValues = filteredData.otu_ids;
    var yValues = filteredData.sample_values;
    var markerSizes = filteredData.sample_values;
    var markerColors = filteredData.otu_ids;
    var textValues = filteredData.otu_labels;

    // Create the trace for the bubble chart
    var trace = {
        x: xValues,
        y: yValues,
        text: textValues,
        mode: 'markers',
        marker: {
            size: markerSizes,
            color: markerColors,
            colorscale: "Earth"
        }
    };

    // Create the data array
    var plotData = [trace];

    // Create the layout for the bubble chart
    var layout = {
        title: "Bacteria Per Sample",
        showlegend: false,
        xaxis: { title: "OTU ID" },
    };

    // Plot the bubble chart
    Plotly.newPlot("bubble", plotData, layout);
}

// Function to display sample metadata
function displayMetadata(sample, metadata) {
    // Filter metadata for the selected sample
    var selectedMetadata = metadata.filter(function(d) {
        return d.id === parseInt(sample);
    })[0];

    // Select the panel body
    var panelBody = d3.select("#sample-metadata");

    // Clear existing metadata
    panelBody.html("");

    // Display each key-value pair from the metadata JSON object
    Object.entries(selectedMetadata).forEach(([key, value]) => {
        panelBody.append("p").text(`${key}: ${value}`);
    });
}

// Call the init function to initialize the dashboard
init();