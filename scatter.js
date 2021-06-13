// Initial Data Cleaning and Data Import //
function editCSV(d) {
    return {
        country: d["Country"],
        region: d["Regional indicator"],
        rank: +d["Rank"],
        score: +d["Score"],
        social: +d["Social support"],
        lifeExpectancy: +d["Healthy life expectancy"],
        freedom: +d["Freedom to make life choices"],
        trust: +d["Perceptions of corruption"],
        pop: +d["Population"],
        generosity: +d["Generosity"],
        gdp: +d["Logged GDP per capita"]
    };
}



const promise = [
    d3.csv("./2020.csv", editCSV)
];

Promise.all(promise).then(function(data) {

    data = data[0];
    console.log(data);

    const width = 1060;
    const height = 680;
    const margin = {top: 50, left: 250, right: 50, bottom: 150};

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const trust = {
        min: d3.min(data, function(d) { return +d.trust; }),
        max: d3.max(data, function(d) { return +d.trust; })
    };

    const freedom = {
        min: d3.min(data, function(d) { return +d.freedom; }),
        max: d3.max(data, function(d) { return +d.freedom; })
    };

    const pop = {
        min: d3.min(data, function(d) { return +d.pop; }),
        max: d3.max(data, function(d) { return +d.pop; })
    }

    const score = {
        min: d3.min(data, function(d) { return +d.score; }),
        max: d3.max(data, function(d) { return +d.score; })
    }

    const loggedgdp = {
        min: d3.min(data, function(d) { return +d.gdp; }),
        max: d3.max(data, function(d) { return +d.gdp; })
    }

    const life = {
        min: d3.min(data, function(d) { return +d.lifeExpectancy; }),
        max: d3.max(data, function(d) { return +d.lifeExpectancy; })
    }

    const social = {
        min: d3.min(data, function(d) { return +d.social; }),
        max: d3.max(data, function(d) { return +d.social; })
    }

    //CREATE SCALES//

    const yScale = d3.scaleLinear()
        .domain([0, score.max])
        .range([height-margin.bottom, margin.top]);

    var xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width-margin.right]);

    const rScale = d3.scaleSqrt()
        .domain([pop.min, pop.max])
        .range([3, 40]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Western Europe", "South Asia", "North America and ANZ", "Middle East and North Africa", "Latin America and Caribbean", "Central and Eastern Europe", "East Asia", "Southeast Asia", "Sub-Saharan Africa", "Commonwealth of Independent States"])
        .range(d3.schemeTableau10);

    var format = d3.format('.2f');

    //Draw Axis//
    const xAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    //Draw Circles and the Initial Scatterplot//
    const points = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function(d) { return xScale(d.trust); })
        .attr("cy", function(d) { return yScale(d.score); })
        .attr("r", function(d) { return rScale(d.pop); })
        .attr("fill", function(d) { return colorScale(d.region); })
        .attr("opacity", 0.9);

        const yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x", margin.left/5 + 40 )
        .attr("y", margin.top + 10)
        .text("Happiness Score");


        var xAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x",margin.left)
        .attr("y",height-margin.bottom/1.75 - 25)
        .text("Perceptions of Corruption");

        var xAxisDescription = svg.append("text")
                .attr("class","axisDescription")
                .attr("x",margin.left)
                .attr("y",height-margin.bottom/1.75 + 10)
                .text('"Is corruption widespread throughout the government or not"');




        // corruption button on click //

        d3.select("#corruption").on("click", function() {

          xScale = d3.scaleLinear()
          .domain([0, 1])
          .range([margin.left, width-margin.right]);

          let c = svg.selectAll("circle")
              .data(data);

              c.enter().append("circle")
                  .attr("cx", function(d) { return xScale(d.trust); })
                  .attr("cy", function(d) { return yScale(d.score); })
                  .attr("r", function(d) { return rScale(d.pop); })
                  .attr("fill", function(d) { return colorScale(d.region); })
                  .attr("opacity", 0.9)
              .merge(c)
                  .transition()
                  .duration(1500)
                  .attr("cx", function(d) { return xScale(d.trust); })
                  .attr("cy", function(d) { return yScale(d.score); })
                  .attr("fill", function(d) { return colorScale(d.region); })
                  .attr("opacity", 0.9);

              c.exit()
                  .transition()
                  .duration(1500)
                  .attr("r",0)
                  .remove();

              svg.selectAll("circle").on("mouseover", function(e, d) {

                  let cx = +d3.select(this).attr("cx")+20;
                  let cy = +d3.select(this).attr("cy")-10;

                  tooltip.style("visibility", "visible")
                      .style("left", `${cx}px`)
                      .style("top", `${cy}px`)
                      .html(`<b>Country:</b> ${d.country}<br>
                             <b>Rank: </b> ${d.rank}<br>
                             <b>Happiness Score:</b> ${format(d.score)}<br>
                             <b>Perceptions of Corruption:</b> ${format(d.trust)}`);

                  d3.select(this)
                      .attr("stroke", "#ffffff")
                      .attr("stroke-width", 3);

              }).on("mouseout", function() {

                  let cr = +d3.select(this).attr("r");

                  tooltip.style("visibility", "hidden");

                  d3.select(this)
                      .attr("stroke", "none")
                      .attr("stroke-width", 0);
              })

              svg.selectAll("text").remove();

              const xAxis = svg.append("g")
                  .attr("class","axis")
                  .attr("transform", `translate(0,${height-margin.bottom})`)
                  .call(d3.axisBottom().scale(xScale));

              const yAxis = svg.append("g")
                  .attr("class","axis")
                  .attr("transform", `translate(${margin.left},0)`)
                  .call(d3.axisLeft().scale(yScale));

              var xAxisLabel = svg.append("text")
                  .attr("class","axisLabel")
                  .attr("x",margin.left)
                  .attr("y",height-margin.bottom/1.75 - 25)
                  .text("Perceptions of Corruption");

              const yAxisLabel = svg.append("text")
                  .attr("class","axisLabel")
                  .attr("x", margin.left/5 + 40 )
                  .attr("y", margin.top + 10)
                  .text("Happiness Score");

                  var xAxisDescription = svg.append("text")
                          .attr("class","axisDescription")
                          .attr("x",margin.left)
                          .attr("y",height-margin.bottom/1.75 + 10)
                          .text('"Is corruption widespread throughout the government or not?"');

          });

          //social support button on click//

          d3.select("#social").on("click", function() {

            xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([margin.left, width-margin.right]);

            let c = svg.selectAll("circle")
                .data(data);

                c.enter().append("circle")
                    .attr("cx", function(d) { return xScale(d.social); })
                    .attr("cy", function(d) { return yScale(d.score); })
                    .attr("r", function(d) { return rScale(d.pop); })
                    .attr("fill", function(d) { return colorScale(d.region); })
                    .attr("opacity", 0.9)
                .merge(c)
                    .transition()
                    .duration(1500)
                    .attr("cx", function(d) { return xScale(d.social); })
                    .attr("cy", function(d) { return yScale(d.score); })
                    .attr("fill", function(d) { return colorScale(d.region); })
                    .attr("opacity", 0.9);

                c.exit()
                    .transition()
                    .duration(1500)
                    .attr("r",0)
                    .remove();

                svg.selectAll("circle").on("mouseover", function(e, d) {

                    let cx = +d3.select(this).attr("cx")+20;
                    let cy = +d3.select(this).attr("cy")-10;

                    tooltip.style("visibility", "visible")
                        .style("left", `${cx}px`)
                        .style("top", `${cy}px`)
                        .html(`<b>Country:</b> ${d.country}<br>
                               <b>Rank: </b> ${d.rank}<br>
                               <b>Happiness Score:</b> ${format(d.score)}<br>
                               <b>Social Support:</b> ${format(d.social)}`);

                    d3.select(this)
                        .attr("stroke", "#ffffff")
                        .attr("stroke-width", 3);

                }).on("mouseout", function() {

                    let cr = +d3.select(this).attr("r");

                    tooltip.style("visibility", "hidden");

                    d3.select(this)
                        .attr("stroke", "none")
                        .attr("stroke-width", 0);
                })

                svg.selectAll("text").remove();

                const xAxis = svg.append("g")
                    .attr("class","axis")
                    .attr("transform", `translate(0,${height-margin.bottom})`)
                    .call(d3.axisBottom().scale(xScale));

                const yAxis = svg.append("g")
                    .attr("class","axis")
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft().scale(yScale));

                var xAxisLabel = svg.append("text")
                    .attr("class","axisLabel")
                    .attr("x",margin.left)
                    .attr("y",height-margin.bottom/1.75 - 25)
                    .text("Social Support");

                const yAxisLabel = svg.append("text")
                    .attr("class","axisLabel")
                    .attr("x", margin.left/5 + 40 )
                    .attr("y", margin.top + 10)
                    .text("Happiness Score");
                  var xAxisDescription = svg.append("text")
                            .attr("class","axisDescription")
                            .attr("x",margin.left)
                            .attr("y",height-margin.bottom/1.75 + 10)
                            .text('"If you were in trouble, do you have relatives or friends you can count on to help you whenever you need them, or not?"');


            });

            //generosity button on click//
            d3.select("#generosity").on("click", function() {

              xScale = d3.scaleLinear()
              .domain([-0.5, 1])
              .range([margin.left, width-margin.right]);

              let c = svg.selectAll("circle")
                  .data(data);

                  c.enter().append("circle")
                      .attr("cx", function(d) { return xScale(d.generosity); })
                      .attr("cy", function(d) { return yScale(d.score); })
                      .attr("r", function(d) { return rScale(d.pop); })
                      .attr("fill", function(d) { return colorScale(d.region); })
                      .attr("opacity", 0.9)
                  .merge(c)
                      .transition()
                      .duration(1500)
                      .attr("cx", function(d) { return xScale(d.generosity); })
                      .attr("cy", function(d) { return yScale(d.score); })
                      .attr("fill", function(d) { return colorScale(d.region); })
                      .attr("opacity", 0.9);

                  c.exit()
                      .transition()
                      .duration(1500)
                      .attr("r",0)
                      .remove();

                  svg.selectAll("circle").on("mouseover", function(e, d) {

                      let cx = +d3.select(this).attr("cx")+20;
                      let cy = +d3.select(this).attr("cy")-10;

                      tooltip.style("visibility", "visible")
                          .style("left", `${cx}px`)
                          .style("top", `${cy}px`)
                          .html(`<b>Country:</b> ${d.country}<br>
                                 <b>Rank: </b> ${d.rank}<br>
                                 <b>Happiness Score:</b> ${format(d.score)}<br>
                                 <b>Generosity:</b> ${format(d.generosity)}`);

                      d3.select(this)
                          .attr("stroke", "#ffffff")
                          .attr("stroke-width", 3);

                  }).on("mouseout", function() {

                      let cr = +d3.select(this).attr("r");

                      tooltip.style("visibility", "hidden");

                      d3.select(this)
                          .attr("stroke", "none")
                          .attr("stroke-width", 0);
                  })

                  svg.selectAll("text").remove();

                  const xAxis = svg.append("g")
                      .attr("class","axis")
                      .attr("transform", `translate(0,${height-margin.bottom})`)
                      .call(d3.axisBottom().scale(xScale));

                  const yAxis = svg.append("g")
                      .attr("class","axis")
                      .attr("transform", `translate(${margin.left},0)`)
                      .call(d3.axisLeft().scale(yScale));

                  var xAxisLabel = svg.append("text")
                      .attr("class","axisLabel")
                      .attr("x",margin.left)
                      .attr("y",height-margin.bottom/1.75 - 25)
                      .text("Generosity");

                  const yAxisLabel = svg.append("text")
                      .attr("class","axisLabel")
                      .attr("x", margin.left/5 + 40 )
                      .attr("y", margin.top + 10)
                      .text("Happiness Score");
                      var xAxisDescription = svg.append("text")
                              .attr("class","axisDescription")
                              .attr("x",margin.left)
                              .attr("y",height-margin.bottom/1.75 + 10)
                              .text('"Have you donated money to a charity in the past month?"');

              });

    //Logged GDP per Capita button on click//

    d3.select("#gdp").on("click", function() {

      xScale = d3.scaleLinear()
      .domain([5,12.5])
      .range([margin.left, width-margin.right]);

      let c = svg.selectAll("circle")
          .data(data);

          c.enter().append("circle")
              .attr("cx", function(d) { return xScale(d.gdp); })
              .attr("cy", function(d) { return yScale(d.score); })
              .attr("r", function(d) { return rScale(d.pop); })
              .attr("fill", function(d) { return colorScale(d.region); })
              .attr("opacity", 0.9)
          .merge(c)
              .transition()
              .duration(1500)
              .attr("cx", function(d) { return xScale(d.gdp); })
              .attr("cy", function(d) { return yScale(d.score); })
              .attr("fill", function(d) { return colorScale(d.region); })
              .attr("opacity", 0.9);

          c.exit()
              .transition()
              .duration(1500)
              .attr("r",0)
              .remove();

          svg.selectAll("circle").on("mouseover", function(e, d) {

              let cx = +d3.select(this).attr("cx")+20;
              let cy = +d3.select(this).attr("cy")-10;

              tooltip.style("visibility", "visible")
                  .style("left", `${cx}px`)
                  .style("top", `${cy}px`)
                  .html(`<b>Country:</b> ${d.country}<br>
                         <b>Rank: </b> ${d.rank}<br>
                         <b>Happiness Score:</b> ${format(d.score)}<br>
                         <b>Logged GDP per Capita:</b> ${format(d.gdp)}`);

              d3.select(this)
                  .attr("stroke", "#ffffff")
                  .attr("stroke-width", 3);

          }).on("mouseout", function() {

              let cr = +d3.select(this).attr("r");

              tooltip.style("visibility", "hidden");

              d3.select(this)
                  .attr("stroke", "none")
                  .attr("stroke-width", 0);
          })

          svg.selectAll("text").remove();

          const xAxis = svg.append("g")
              .attr("class","axis")
              .attr("transform", `translate(0,${height-margin.bottom})`)
              .call(d3.axisBottom().scale(xScale));

          const yAxis = svg.append("g")
              .attr("class","axis")
              .attr("transform", `translate(${margin.left},0)`)
              .call(d3.axisLeft().scale(yScale));

          var xAxisLabel = svg.append("text")
              .attr("class","axisLabel")
              .attr("x",margin.left)
              .attr("y",height-margin.bottom/1.75 - 25)
              .text("Logged GDP per Capita (USD)");

          const yAxisLabel = svg.append("text")
              .attr("class","axisLabel")
              .attr("x", margin.left/5 + 40 )
              .attr("y", margin.top + 10)
              .text("Happiness Score");
              var xAxisDescription = svg.append("text")
                      .attr("class","axisDescription")
                      .attr("x",margin.left)
                      .attr("y",height-margin.bottom/1.75 + 10)
                      .text('Natural log of GDP per capita in terms of Purchasing Power Parity (PPP), adjusted to international dollars');

      });

      //Healthy Life Expectancy button on click//

      d3.select("#life").on("click", function() {

        xScale = d3.scaleLinear()
        .domain([40,80])
        .range([margin.left, width-margin.right]);

        let c = svg.selectAll("circle")
            .data(data);

            c.enter().append("circle")
                .attr("cx", function(d) { return xScale(d.lifeExpectancy); })
                .attr("cy", function(d) { return yScale(d.score); })
                .attr("r", function(d) { return rScale(d.pop); })
                .attr("fill", function(d) { return colorScale(d.region); })
                .attr("opacity", 0.9)
            .merge(c)
                .transition()
                .duration(1500)
                .attr("cx", function(d) { return xScale(d.lifeExpectancy); })
                .attr("cy", function(d) { return yScale(d.score); })
                .attr("fill", function(d) { return colorScale(d.region); })
                .attr("opacity", 0.9);

            c.exit()
                .transition()
                .duration(1500)
                .attr("r",0)
                .remove();

            svg.selectAll("circle").on("mouseover", function(e, d) {

                let cx = +d3.select(this).attr("cx")+20;
                let cy = +d3.select(this).attr("cy")-10;

                tooltip.style("visibility", "visible")
                    .style("left", `${cx}px`)
                    .style("top", `${cy}px`)
                    .html(`<b>Country:</b> ${d.country}<br>
                           <b>Rank: </b> ${d.rank}<br>
                           <b>Happiness Score:</b> ${format(d.score)}<br>
                           <b>Healthy Life Expectancy:</b> ${format(d.lifeExpectancy)}`);

                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 3);

            }).on("mouseout", function() {

                let cr = +d3.select(this).attr("r");

                tooltip.style("visibility", "hidden");

                d3.select(this)
                    .attr("stroke", "none")
                    .attr("stroke-width", 0);
            })

            svg.selectAll("text").remove();

            const xAxis = svg.append("g")
                .attr("class","axis")
                .attr("transform", `translate(0,${height-margin.bottom})`)
                .call(d3.axisBottom().scale(xScale));

            const yAxis = svg.append("g")
                .attr("class","axis")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft().scale(yScale));

            var xAxisLabel = svg.append("text")
                .attr("class","axisLabel")
                .attr("x",margin.left)
                .attr("y",height-margin.bottom/1.75 - 25)
                .text("Healthy Life Expectancy (Year)");

            const yAxisLabel = svg.append("text")
                .attr("class","axisLabel")
                .attr("x", margin.left/5 + 40 )
                .attr("y", margin.top + 10)
                .text("Happiness Score");
                var xAxisDescription = svg.append("text")
                        .attr("class","axisDescription")
                        .attr("x",margin.left)
                        .attr("y",height-margin.bottom/1.75 + 10)
                        .text('Estimate of how many years people might live in a "healthy" state');


        });

        //Freedom button on click//

        d3.select("#freedom").on("click", function() {

          xScale = d3.scaleLinear()
          .domain([0,1])
          .range([margin.left, width-margin.right]);

          let c = svg.selectAll("circle")
              .data(data);

              c.enter().append("circle")
                  .attr("cx", function(d) { return xScale(d.freedom); })
                  .attr("cy", function(d) { return yScale(d.score); })
                  .attr("r", function(d) { return rScale(d.pop); })
                  .attr("fill", function(d) { return colorScale(d.region); })
                  .attr("opacity", 0.9)
              .merge(c)
                  .transition()
                  .duration(1500)
                  .attr("cx", function(d) { return xScale(d.freedom); })
                  .attr("cy", function(d) { return yScale(d.score); })
                  .attr("fill", function(d) { return colorScale(d.region); })
                  .attr("opacity", 0.9);

              c.exit()
                  .transition()
                  .duration(1500)
                  .attr("r",0)
                  .remove();

              svg.selectAll("circle").on("mouseover", function(e, d) {

                  let cx = +d3.select(this).attr("cx")+20;
                  let cy = +d3.select(this).attr("cy")-10;

                  tooltip.style("visibility", "visible")
                      .style("left", `${cx}px`)
                      .style("top", `${cy}px`)
                      .html(`<b>Country:</b> ${d.country}<br>
                             <b>Rank: </b> ${d.rank}<br>
                             <b>Happiness Score:</b> ${format(d.score)}<br>
                             <b>Freedom to make Life Choices:</b> ${format(d.freedom)}`);

                  d3.select(this)
                      .attr("stroke", "#ffffff")
                      .attr("stroke-width", 3);

              }).on("mouseout", function() {

                  let cr = +d3.select(this).attr("r");

                  tooltip.style("visibility", "hidden");

                  d3.select(this)
                      .attr("stroke", "none")
                      .attr("stroke-width", 0);
              })

              svg.selectAll("text").remove();

              const xAxis = svg.append("g")
                  .attr("class","axis")
                  .attr("transform", `translate(0,${height-margin.bottom})`)
                  .call(d3.axisBottom().scale(xScale));

              const yAxis = svg.append("g")
                  .attr("class","axis")
                  .attr("transform", `translate(${margin.left},0)`)
                  .call(d3.axisLeft().scale(yScale));

              var xAxisLabel = svg.append("text")
                  .attr("class","axisLabel")
                  .attr("x",margin.left)
                  .attr("y",height-margin.bottom/1.75 - 25)
                  .text("Freedom to make Life Choices");

              const yAxisLabel = svg.append("text")
                  .attr("class","axisLabel")
                  .attr("x", margin.left/5 + 40 )
                  .attr("y", margin.top + 10)
                  .text("Happiness Score");
                  var xAxisDescription = svg.append("text")
                          .attr("class","axisDescription")
                          .attr("x",margin.left)
                          .attr("y",height-margin.bottom/1.75 + 10)
                          .text('"Are you satisfied or dissatisfied with your freedom to choose what you do with your life?"');

          });

    //Draw Tooltips When Hovering Over//

    const tooltip = d3.select("#scatter-plot")
        .append("div")
        .attr("class", "tooltip");

    points.on("mouseover", function(e, d) {

        let cx = +d3.select(this).attr("cx");
        let cy = +d3.select(this).attr("cy");
        let cr = +d3.select(this).attr("r");

        tooltip.style("visibility", "visible")
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>Country:</b> ${d.country}<br>
              <b>Rank: </b> ${d.rank}<br>
              <b>Happiness Score: </b> ${d.score}<br>
              <b>Perceptions of Corruption:</b> ${format(d.trust)} <br>
              <b>Freedom to Make Life Choices:</b> ${format(d.freedom)}<br>
              <b>Social Support:</b> ${format(d.social)}<br>
              <b>Generosity:</b> ${format(d.generosity)}<br>
              <b>Logged GDP per Capita:</b> ${format(d.gdp)}<br>
              <b>Healthy Life Expectancy:</b> ${format(d.lifeExpectancy)}<br>`);

        d3.select(this)
            .attr("r", cr+5)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 3);

    }).on("mouseout", function() {

        let cr = +d3.select(this).attr("r");

        tooltip.style("visibility", "hidden");

        d3.select(this)
            .attr("r", cr-5)
            .attr("stroke", "none")
            .attr("stroke-width", 0);
    })

    d3.selectAll("input").on("click", function() {


        let region = d3.select(this).property("value");

        let selection = points.filter(function(d) {
            return d.region === region;
        });

        let isChecked = d3.select(this).property("checked");

        if (isChecked == true) {
            selection.attr("opacity", 0.9)
            .attr("pointer-events", "all");
        } else {
            selection.attr("opacity", 0)
            .attr("pointer-events", "none");
        };
    });
});

//reset checkboxes//
var clicked = false;
$(".data-join").on("click", function() {
$(".checked").prop("checked", !clicked);
clicked = !clicked;
$(".checked").prop("checked", clicked);
clicked = !clicked;

});
