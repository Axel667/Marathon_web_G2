;(function () {
  window.updateRadarChart = function (communeName) {
    // Find the data for the selected city
    var cityData = jsonData.find(function (d) {
      return d.Libellé === communeName
    })

    if (cityData) {
      // Assume processDataForRadarChart is a function that processes your city data into the correct format
      var radarData = processDataForRadarChart(cityData)
      // Assume your radar chart drawing logic is encapsulated in this function
      RadarChart(".radarChart", [radarData], radarChartOptions)
    }
  }
  var jsonData // This will hold the JSON data
  var medianRadarData // This will hold the median radar data
  var showMedianRadar = false // Flag to toggle median radar chart

  // Function to toggle the median radar chart
  window.toggleMedianRadarChart = function () {
    showMedianRadar = !showMedianRadar
    updateRadarChart()
  }

  // Function to update the radar chart display
  function updateRadarChart() {
    // Clear the existing radar chart SVG before redrawing
    d3.select(".radarChart").selectAll("svg").remove()

    

    var dataToDisplay = [processDataForRadarChart(jsonData[0])]
    if (showMedianRadar) {
      // If median data is not calculated, calculate it
      if (!medianRadarData) {
        calculateMedianRadarData()
      }
      // Add the median data for display and set its color to dark grey
      dataToDisplay.push(
        medianRadarData.map(function (d) {
          return { axis: d.axis, value: d.value }
        })
      )
    }
    // Draw the radar chart with the dataToDisplay
    RadarChart(".radarChart", dataToDisplay, radarChartOptions)
  }

  // Function to calculate median radar data
  function calculateMedianRadarData() {
    // Placeholder array for median values
    var axisValues = {}
    jsonData.forEach(function (dataItem) {
      Object.keys(dataItem).forEach(function (key) {
        if (key !== "Libellé") {
          if (!axisValues[key]) {
            axisValues[key] = []
          }
          axisValues[key].push(dataItem[key])
        }
      })
    })

    medianRadarData = Object.keys(axisValues).map(function (key) {
      var sorted = axisValues[key].sort(function (a, b) {
        return a - b
      })
      var middle = Math.floor(sorted.length / 2)
      var isEven = sorted.length % 2 === 0
      var median = isEven
        ? (sorted[middle] + sorted[middle - 1]) / 2
        : sorted[middle]
      return { axis: key, value: median }
    })
  }

  // Load the JSON data
  d3.json("data_normalised.json", function (error, data) {
    if (error) throw error

    jsonData = data // Store the JSON data
    updateRadarChart() // Initial chart update
  })

  // Function to process your data
  function processDataForRadarChart(dataItem) {
    return Object.keys(dataItem)
      .map(function (key) {
        if (key !== "Libellé") {
          return { axis: key, value: dataItem[key] }
        }
      })
      .filter(Boolean) // Removes any undefined entries
  } // Removes any undefined entries

  function RadarChart(id, data, options) {
    var cfg = {
      w: 300, //Width of the circle
      h: 300, //Height of the circle
      margin: { top: 20, right: 20, bottom: 20, left: 20 }, //The margins of the SVG
      levels: 3, //How many levels or inner circles should there be drawn
      maxValue: 0, //What is the value that the biggest circle will represent
      labelFactor: 1.25, //How much farther than the radius of the outer circle should the labels be placed
      wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
      opacityArea: 0.35, //The opacity of the area of the blob
      dotRadius: 7, //The size of the colored circles of each blog
      opacityCircles: 0.1, //The opacity of the circles of each blob
      strokeWidth: 2, //The width of the stroke around each blob
      roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
      color: d3.scale.category10(), //Color function
    }

    //Put all of the options into a variable called cfg
    if ("undefined" !== typeof options) {
      for (var i in options) {
        if ("undefined" !== typeof options[i]) {
          cfg[i] = options[i]
        }
      } //for i
    } //if

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(
      cfg.maxValue,
      d3.max(data, function (i) {
        return d3.max(
          i.map(function (o) {
            return o.value
          })
        )
      })
    )

    var allAxis = data[0].map(function (i, j) {
        return i.axis
      }), //Names of each axis
      total = allAxis.length, //The number of different axes
      radius = Math.min(cfg.w / 2, cfg.h / 2), //Radius of the outermost circle
      Format = d3.format("%"), //Percentage formatting
      angleSlice = (Math.PI * 2) / total //The width in radians of each "slice"

    //Scale for the radius
    var rScale = d3.scale.linear().range([0, radius]).domain([0, maxValue])

    //////////// Create the container SVG and g /////////////

    //Initiate the radar chart SVG
    var svg = d3
      .select(id)
      .append("svg")
      .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
      .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
      .attr("class", "radar" + id)
    //Append a g element
    var g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (cfg.w / 2 + cfg.margin.left) +
          "," +
          (cfg.h / 2 + cfg.margin.top) +
          ")"
      )

    ////////// Glow filter for some extra pizzazz ///////////

    //Filter for the outside glow
    var filter = g.append("defs").append("filter").attr("id", "glow"),
      feGaussianBlur = filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "2.5")
        .attr("result", "coloredBlur"),
      feMerge = filter.append("feMerge"),
      feMergeNode_1 = feMerge.append("feMergeNode").attr("in", "coloredBlur"),
      feMergeNode_2 = feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    /////////////// Draw the Circular grid //////////////////

    //Wrapper for the grid & axes
    var axisGrid = g.append("g").attr("class", "axisWrapper")

    //Draw the background circles
    axisGrid
      .selectAll(".levels")
      .data(d3.range(1, cfg.levels + 1).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", function (d, i) {
        return (radius / cfg.levels) * d
      })
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", cfg.opacityCircles)
      .style("filter", "url(#glow)")

    //Text indicating at what % each level is
    axisGrid
      .selectAll(".axisLabel")
      .data(d3.range(1, cfg.levels + 1).reverse())
      .enter()
      .append("text")
      .attr("class", "axisLabel")
      .attr("x", 4)
      .attr("y", function (d) {
        return (-d * radius) / cfg.levels
      })
      .attr("dy", "0.4em")
      .style("font-size", "10px")
      .attr("fill", "#737373")
      .text(function (d, i) {
        return Format((maxValue * d) / cfg.levels)
      })

    //////////////////// Draw the axes //////////////////////

    //Create the straight lines radiating outward from the center
    var axis = axisGrid
      .selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis")
    //Append the lines
    axis
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", function (d, i) {
        return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)
      })
      .attr("y2", function (d, i) {
        return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2)
      })
      .attr("class", "line")
      .style("stroke", "white")
      .style("stroke-width", "2px")

    //Append the labels at each axis
    axis
      .append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", function (d, i) {
        return (
          rScale(maxValue * cfg.labelFactor) *
          Math.cos(angleSlice * i - Math.PI / 2)
        )
      })
      .attr("y", function (d, i) {
        return (
          rScale(maxValue * cfg.labelFactor) *
          Math.sin(angleSlice * i - Math.PI / 2)
        )
      })
      .text(function (d) {
        return d
      })
      .call(wrap, cfg.wrapWidth)

    ///////////// Draw the radar chart blobs ////////////////

    //The radial line function
    var radarLine = d3.svg.line
      .radial()
      .interpolate("linear-closed")
      .radius(function (d) {
        return rScale(d.value)
      })
      .angle(function (d, i) {
        return i * angleSlice
      })

    if (cfg.roundStrokes) {
      radarLine.interpolate("cardinal-closed")
    }

    //Create a wrapper for the blobs
    var blobWrapper = g
      .selectAll(".radarWrapper")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "radarWrapper")

    //Append the backgrounds
    blobWrapper
      .append("path")
      .attr("class", "radarArea")
      .attr("d", function (d, i) {
        return radarLine(d)
      })
      .style("fill", function (d, i) {
        return cfg.color(i)
      })
      .style("fill-opacity", cfg.opacityArea)
      .on("mouseover", function (d, i) {
        //Dim all blobs
        d3.selectAll(".radarArea")
          .transition()
          .duration(200)
          .style("fill-opacity", 0.1)
        //Bring back the hovered over blob
        d3.select(this).transition().duration(200).style("fill-opacity", 0.7)
      })
      .on("mouseout", function () {
        //Bring back all blobs
        d3.selectAll(".radarArea")
          .transition()
          .duration(200)
          .style("fill-opacity", cfg.opacityArea)
      })

    //Create the outlines
    blobWrapper
      .append("path")
      .attr("class", "radarStroke")
      .attr("d", function (d, i) {
        return radarLine(d)
      })
      .style("stroke-width", cfg.strokeWidth + "px")
      .style("stroke", function (d, i) {
        return cfg.color(i)
      })
      .style("fill", "none")
      .style("filter", "url(#glow)")

    //Append the circles
    blobWrapper
      .selectAll(".radarCircle")
      .data(function (d, i) {
        return d
      })
      .enter()
      .append("circle")
      .attr("class", "radarCircle")
      .attr("r", cfg.dotRadius) // Use the updated radius
      .attr("cx", function (d, i) {
        return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)
      })
      .attr("cy", function (d, i) {
        return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
      })
      .style("fill", function (d, i, j) {
        return cfg.color(j)
      })
      .style("fill-opacity", 0.8)
      .style("stroke", "#fff") // Add white contour
      .style("stroke-width", "2px") // Adjust contour width as needed

    //////// Append invisible circles for tooltip ///////////

    //Wrapper for the invisible circles on top
    var blobCircleWrapper = g
      .selectAll(".radarCircleWrapper")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "radarCircleWrapper")

    //Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper
      .selectAll(".radarInvisibleCircle")
      .data(function (d, i) {
        return d
      })
      .enter()
      .append("circle")
      .attr("class", "radarInvisibleCircle")
      .attr("r", cfg.dotRadius * 1.5)
      .attr("cx", function (d, i) {
        return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)
      })
      .attr("cy", function (d, i) {
        return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
      })
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function (d, i) {
        var newX = parseFloat(d3.select(this).attr("cx")) - 10
        var newY = parseFloat(d3.select(this).attr("cy")) - 10

        // Select the tooltip element and populate it
        var tooltip = d3.select("#radarTooltip")
        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(data[0][i].axis + ": " + Format(d.value)) // Adjust this to include the city name if needed
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        // Hide the tooltip on mouseout
        d3.select("#radarTooltip")
          .transition()
          .duration(500)
          .style("opacity", 0)
      })

    //Set up the small tooltip for when you hover over a circle
    var tooltip = g.append("text").attr("class", "tooltip").style("opacity", 0)

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
      text.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.4, // ems
          y = text.attr("y"),
          x = text.attr("x"),
          dy = parseFloat(text.attr("dy")),
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em")

        while ((word = words.pop())) {
          line.push(word)
          tspan.text(line.join(" "))
          if (tspan.node().getComputedTextLength() > width) {
            line.pop()
            tspan.text(line.join(" "))
            line = [word]
            tspan = text
              .append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word)
          }
        }
      })
    } //wrap
  } //RadarChart

  window.updateRadarChart = function (communeName) {
    console.log("updateRadarChart called for:", communeName)
    d3.json("data_normalised.json", function (error, jsonData) {
      if (error) throw error

      // Find the data for the selected city
      var cityData = jsonData.find(function (d) {
        return d["Libellé"] === communeName // Ensure 'Libellé' matches the property name in your data
      })

      if (cityData) {
        console.log("Data found for:", communeName, cityData) // Debugging line
        // Process data for the radar chart for the selected city
        var radarData = processDataForRadarChart(cityData) // Ensure this function exists and correctly formats data for the radar chart

        // Clear the existing radar chart SVG before redrawing
        d3.select(".radarChart").selectAll("svg").remove()

        // Draw the radar chart for the selected city
        RadarChart(".radarChart", [radarData], radarChartOptions) // Ensure 'RadarChart' and 'radarChartOptions' are correctly defined and accessible
      } else {
        console.log("No data found for:", communeName) // Debugging line
      }
    })
  }
})()
