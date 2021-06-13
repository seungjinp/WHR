const svg = d3.select("#choropleth");
const width = svg.attr("width");
const height = svg.attr("height");

const margin = { top: 50, right: 10, bottom: 35, left: 10 };
const mapWidth = width - margin.left - margin.right;
const mapHeight = height - margin.top - margin.bottom;

// graph title
svg.append("text")
  .attr("text-anchor", "middle")
  .attr("font-size", "22px")
  .attr("font-family", "Montserrat")
  .attr("font-weight", "bold")
  .attr("x", width / 2)
  .attr('y', 20)
  .text("Graph 1: World Map of Happiness Score from 2018 to 2020");

const map = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// ------- Data Import ------
Promise.all([
  d3.json("world.geo.json"),
  d3.csv("2018.csv"),
  d3.csv("2019.csv"),
  d3.csv("2020.csv"),
]).then((files) => {
  const geoCountry = files[0];
  const scores = [files[1], files[2], files[3]]

  console.log(geoCountry);
  console.log(scores[0]);
  console.log(scores[1]);
  console.log(scores[2]);
  // console.log(score2021);


  var projection = d3.geoMercator().fitSize([mapWidth, mapHeight], geoCountry);
  var path = d3.geoPath().projection(projection);

  // ------- DRAW MAP ------
  map.selectAll('path')
    .data(geoCountry.features)
    .enter()
    .append('path')
    .style('stroke', 'white')
    .style('stroke-width', '1px')
    .attr('d', path)
    .attr("class", "country")
    .attr("note", d => d["properties"]["name"]);


  // coloscale

  // const maxScore = d3.max(currScore, d => d['Score']);
  // const minScore = d3.min(currScore, d => d['Score']);
  // console.log("max Score is", maxScore);
  // console.log("min Score is", minScore);
  let colorScale = d3.scaleThreshold().domain([3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]).range(d3.schemeRdYlBu[11].reverse());

  function colorMap(year) {
    console.log(year);
    const currScore = scores[year - 2018];

    var dict = [];
    currScore.forEach(d => {
      dict[d['Country']] = parseFloat(d['Score']);
    })
    console.log(dict);

    map.selectAll('path')
      .attr('fill', d => {
        const countryName = d['properties']['name'];
        if (countryName in dict) {
          return colorScale(dict[countryName]);
        } else {
          return '#e8e8e8';
        }
      });

    //------- Tooltip ------
    let tooltipWidth = 120;
    let tooltipHeight = 40;

    let tooltip = map.append("g")
      .attr("class", "tooltip")
      .attr("visibility", "hidden");
    tooltip.append("rect")
      .attr("fill", "black")
      .attr("opacity", 0.9)
      .attr("x", -tooltipWidth / 2.0)
      .attr("y", 0)
      .attr("width", tooltipWidth)
      .attr("height", tooltipHeight)
    let txt = tooltip.append("text")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .attr("x", 0)
      .attr("y", 2);
    let txt2 = tooltip.append("text")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .attr("x", 0)
      .attr("y", 22);
    // let momesh = map.append("path")
    //   .attr("class", "mouseover outline")
    //   .attr("d", "");

    d3.selectAll(".country").on("mouseenter", mouseEntersPlot);
    d3.selectAll(".country").on("mouseout", mouseLeavesPlot);

    function mouseEntersPlot() {


      tooltip.style("visibility", "visible")
      let country = d3.select(this);

      let thisName = country.datum().properties.name;
      txt.text(thisName);

      //change the opacity
      map.selectAll('path')
        .attr('opacity', d => {
          const countryName = d['properties']['name'];
          if (countryName === thisName) {
            return 1;
          } else {
            return 0.3;
          }
        });

      txt2.text(() => {
        if (thisName in dict) {
          return dict[thisName]
        } else {
          return "Unknown"
        }
      });

      let bounds = path.bounds(country.datum());
      let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
      let yPos = bounds[1][1];
      tooltip.attr("transform", `translate(${xPos},${yPos})`);
    }
    function mouseLeavesPlot() {
      tooltip.style("visibility", "hidden");
      map.selectAll('path')
        .attr('opacity', 1);
    }
  }

  colorMap(2019);

  const allKeys = [2018, 2019, 2020];
  allKeys.forEach(d => {
    // For each year key, add a new button to the button bar
    d3.select("#button-bar")
      .append("button")
      .style("font-family", "Montserrat")
      .style("background-color", "white")
      .style("margin-right", "20px")
      .style("border-width", "2px")
      .style("border-color", "lightgrey")
      .style("cursor", "pointer")
      .text(`Year: ${d}`)
      .on("click", function () {
        // When it's clicked, call updateBars to update the chart
        colorMap(d);
      })
  });

  //------- Legend ------
  function drawLegend(legend, legendColorScale) {

    //  Credit Prof. Rz
    const legendWidth = legend.attr("width");
    const legendHeight = legend.attr("height");
    const legendMinMax = d3.extent(legendColorScale.domain());
    const barHeight = 20;
    const stepSize = 4;
    const pixelScale = d3.scaleLinear().domain([0, legendWidth - 40]).range([legendMinMax[0] - 0.5, legendMinMax[1] + 0.5]); // In this case the "data" are pixels, and we get numbers to use in colorScale
    const barScale = d3.scaleLinear().domain([legendMinMax[0] - 0.5, legendMinMax[1] + 0.5]).range([0, legendWidth - 40]);
    const barAxis = d3.axisBottom(barScale);

    if (legendColorScale.hasOwnProperty('quantiles')) {
      barAxis.tickValues(legendColorScale.quantiles().concat(legendMinMax));
    }
    legend.append("g")
      .attr("class", "colorbar axis")
      .attr("transform", "translate(" + (20) + "," + (barHeight + 5) + ")")
      .call(barAxis);

    let bar = legend.append("g").attr("transform", "translate(" + (20) + "," + (0) + ")");
    console.log('here')

    for (let i = 0; i < legendWidth - 40; i = i + stepSize) {

      bar.append("rect")
        .attr("x", i)
        .attr("y", 0)
        .attr("width", stepSize)
        .attr("height", barHeight)
        .style("fill", legendColorScale(pixelScale(i)));
    }

    bar.append("line").attr("stroke", "white").attr("stroke-width", 3).attr("x1", barScale(legendMinMax[0])).attr("x2", barScale(legendMinMax[0])).attr("y1", 0).attr("y1", barHeight + 4);
    bar.append("line").attr("stroke", "white").attr("stroke-width", 3).attr("x1", barScale(legendMinMax[1])).attr("x2", barScale(legendMinMax[1])).attr("y1", 0).attr("y1", barHeight + 4);
  }

  drawLegend(d3.select("#colorLegend"), colorScale);


});
