var width = 200,
  height = 300; // adjust for height of input bar div

var color = d3.scale.category20();

// draw and append the container
var svg = d3.select("donut").append("svg")
.attr("width", width).attr("height", height);

// set the thickness of the inner and outer radii
var min = Math.min(width, height);
var oRadius = min / 2 * 0.9;
var iRadius = min / 2 * 0.6;

// construct default pie laoyut
var pie = d3.layout.pie().value(function(d){ return d; }).sort(null);

// construct arc generator
var arc = d3.svg.arc()
.outerRadius(oRadius)
.innerRadius(iRadius);

// creates the pie chart container
var g = svg.append('g')
var g = svg.append('g')
.attr('transform', function(){
  if ( window.innerWidth >= 960 ) var shiftWidth = width / 2;
  if ( window.innerWidth < 960 ) var shiftWidth = width / 3;
  return 'translate(' + shiftWidth + ',' + height / 2 + ')';
})

// generate random data
var data = [20, 40-20];

// enter data and draw pie chart
var path = g.datum(data).selectAll("path")
.data(pie)
.enter().append("path")
  .attr("class","piechart")
  .attr("fill", function(d,i){ return color(i); })
  .attr("d", arc)
  .each(function(d){ this._current = d; })

function render(BMI){
// generate new random data
data = [BMI, 40-BMI];
// add transition to new path
g.datum(data).selectAll("path").data(pie).transition().duration(1000).attrTween("d", arcTween);

// add any new paths
g.datum(data).selectAll("path")
  .data(pie)
.enter().append("path")
  .attr("class","piechart")
  .attr("fill", function(d,i){ return color(i); })
  .attr("d", arc)
  .each(function(d){ this._current = d; })

// remove data not being used
g.datum(data).selectAll("path")
  .data(pie).exit().remove();
  
g.selectAll("text").remove();
g.append("text")
    .attr("text-anchor", "middle")
    .style("font-size","40px")
    .attr("dy", "15px")
    .text(function(d) { return data[0].toFixed(1); });

g.append("text")
    .attr("text-anchor", "middle")
    .style("font-size","40px")
    .attr("dy", "135px")
    .text(function(d) { return "BMI"; });
}


g.append("text")
    .attr("text-anchor", "middle")
    .style("font-size","40px")
    .attr("dy", "15px")
    .text(function(d) { return data[0]; });

g.append("text")
    .attr("text-anchor", "middle")
    .style("font-size","40px")
    .attr("dy", "135px")
    .text(function(d) { return "BMI"; });

render(20);

function makeData(size){
return d3.range(size).map(function(item){
 return Math.random()*100;
});
};

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
var i = d3.interpolate(this._current, a);
this._current = i(0);
return function(t) {
  return arc(i(t));
};
}