var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 200 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10, "");

var color = d3.scale.category20();

var svgArea = d3.select("areamap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", function(d,i){ return color(i); })
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function renderArea(data){
    //console.log(data);
    svgArea.selectAll("text").remove();
    svgArea.selectAll(".bar").remove();
  x.domain(data.map(function(d) { return d.name; }));
  y.domain([0, 180]);

    

  svgArea.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svgArea.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Krvni tlak");

  svgArea.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("fill", function(d,i){ 
          if(i == 0){
              console.log(color(i));
            return (data[i].frequency > 80)? "#cc3333":color(i); 
          }
          else if(i == 1){
              console.log(color(i));
            return (data[i].frequency > 120)? "#cc3333":color(i); 
          }
      })
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });
}

function type(d) {
  d.frequency = +d.frequency;
  return d;
}
