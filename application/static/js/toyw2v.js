$(document).ready(function() {
  //set_default_config();
  init();

  $("#btn-load").click(loadButtonClick);
//  $("#btn-preprocess").click(preProcess);
  $("#btn-extracttopics").click(extracttopic);
  //$("#btn-match").click(match);
  $("#btn-match").click(matchv2);
});

function init() {
  $("#error").empty().hide();
  setup_rm_hierarchy_svg();
}

function show_error(e) {
  console.log(e);
  var new_error = '<p>' + e + '</p>';
  $('#error').append(new_error);
  $('#error').show();
}


function project(x, y) {
  var angle = (x - 90) / 180 * Math.PI, radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}


function setup_rm_hierarchy_svg() {
	
  nn_svg_width = 2000;  // view box, not physical
  nn_svg_height = 1400;  // W/H ratio should match padding-bottom in wevi.css
  d3.select('div#neuron-vis > *').remove();
  nn_svg = d3.select('div#neuron-vis')
   .append("div")
   .classed("svg-container", true) //container class to make it responsive
   .classed("neural-net", true)
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + nn_svg_width + " " + nn_svg_height)
   //class to make it responsive
   .classed("svg-content-responsive", true)
   .classed("neural-net", true);  // for picking up svg from outside


	
    g = nn_svg.append("g").attr("transform", "translate(" + (nn_svg_width/1.5  + 40) + "," + (nn_svg_height/2 + 90) + ")");

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

var tree = d3.tree()
    .size([360, 500])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

d3.csv("static/RTreeData.csv", function(error, data) {
  if (error) throw error;

  var root = tree(stratify(data));

  var link = g.selectAll(".link")
    .data(root.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
      });

  var node = g.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
      .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

  node.append("circle")
      .attr("r", 2.5);

  node.append("text")
      .attr("dy", ".31em")
      .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
      .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
      .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
      .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
});
	
}

function loadButtonClick() {
//<script type="text/javascript" src="https://apis.google.com/js/api.js?onload=loadPicker"></script>
loadPicker();
}



function project(x, y) {
  var angle = (x - 90) / 180 * Math.PI, radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}


function markred_rm_hierarchy_svg() {
	
  nn_svg_width = 2000;  // view box, not physical
  nn_svg_height = 1400;  // W/H ratio should match padding-bottom in wevi.css
  d3.select('div#neuron-vis > *').remove();
  nn_svg = d3.select('div#neuron-vis')
   .append("div")
   .classed("svg-container", true) //container class to make it responsive
   .classed("neural-net", true)
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + nn_svg_width + " " + nn_svg_height)
   //class to make it responsive
   .classed("svg-content-responsive", true)
   .classed("neural-net", true);  // for picking up svg from outside


	
    g = nn_svg.append("g").attr("transform", "translate(" + (nn_svg_width/1.5  + 40) + "," + (nn_svg_height/2 + 90) + ")");

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

var tree = d3.tree()
    .size([360, 500])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

d3.csv("static/markedRTree.csv", function(error, data) {
  if (error) throw error;

  var root = tree(stratify(data));

  var link = g.selectAll(".link")
    .data(root.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
      });

  var node = g.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
      .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

  node.append("circle")
      .attr("r", 2.5);


  node.append("text")
      .attr("dy", ".31em")
      .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
      .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
      .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
      .attr("fill",function(d){ /*if (d.data.value.indexOf("red") !== -1) return "red"*/ return d.data.value;})
      .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });


});//end csv


}













