$(document).ready(function() {
  set_default_training_data();
  set_default_config();
  init();

//  $("#btn-restart").click(updateAndRestartButtonClick);
  $("#btn-load").click(loadButtonClick);
  $("#btn-preprocess").click(preProcess);
//  $("#btn-next20").click(function(){batchTrain(20)});
//  $("#btn-next100").click(function(){batchTrain(100)});
//  $("#btn-next500").click(function(){batchTrain(500)});
//  $("#btn-learning-rate").click(function(){load_config()});
});

function init() {
  $("#error").empty().hide();
  load_training_data();  // this needs to be loaded first to determine vocab
  load_config();
  setup_neural_net();
  setup_rm_hierarchy_svg();
  //update_neural_net_svg();
  //setup_heatmap_svg();
  //update_heatmap_svg();
  //update_pca();
  //setup_scatterplot_svg();
  //update_scatterplot_svg();

  // initial feed-forward
  //do_feed_forward();
  //update_neural_excite_value();
}

function set_default_config() {
  var default_config_obj = {
    hidden_size: 5,
    random_state: 1,
    learning_rate: 0.2,
  };
  $('#config-text').html(JSON.stringify(default_config_obj, null, ''));
}

function load_config() {
  config_obj = {};  // global
  var config_json = $("#config-text").val();
  try{
    config_obj = JSON.parse(config_json);
  } catch (e) {
    show_error("Error parsing the configuration json");
    show_error('The json: ' + config_json);
    return;
  }
  if (config_obj.hidden_size > vocab.length) {
    show_error("Error: hidden layer size cannot exceed vocabulary size.");
  }
}

function set_default_training_data() {
  var presets = 
    [{name:"Fruit and juice", data:"eat|apple,eat|orange,eat|rice,drink|juice,drink|milk,drink|water,orange|juice,apple|juice,rice|milk,milk|drink,water|drink,juice|drink"},
     {name:"Fruit and juice (CBOW)", data: "drink^juice|apple,eat^apple|orange,drink^juice|rice,drink^milk|juice,drink^rice|milk,drink^milk|water,orange^apple|juice,apple^drink|juice,rice^drink|milk,milk^water|drink,water^juice|drink,juice^water|drink"},
     {name:"Fruit and juice (Skip-gram)", data: "apple|drink^juice,orange|eat^apple,rice|drink^juice,juice|drink^milk,milk|drink^rice,water|drink^milk,juice|orange^apple,juice|apple^drink,milk|rice^drink,drink|milk^water,drink|water^juice,drink|juice^water"},
     {name:"Self loop (5-point)", data:"A|A,B|B,C|C,D|D,E|E"},
     {name:"Directed loop (5-point)", data:"A|B,B|C,C|D,D|E,E|A"},
     {name:"Undirected loop (5-point)", data:"A|B,B|C,C|D,D|E,E|A,B|A,C|B,D|C,E|D,A|E"},
     {name:"King and queen", data: "king|kindom,queen|kindom,king|palace,queen|palace,king|royal,queen|royal,king|George,queen|Mary,man|rice,woman|rice,man|farmer,woman|farmer,man|house,woman|house,man|George,woman|Mary"},
     {name:"King and queen (symbol)", data: "king|a,queen|a,king|b,queen|b,king|c,queen|c,king|x,queen|y,man|d,woman|d,man|e,woman|e,man|f,woman|f,man|x,woman|y"},
    ];
  
  $('#input-text').html(presets[0].data);

  var select = d3.select("#sel-presets");

  var options = select.selectAll("option")
    .data(presets)
    .enter()
    .append("option")
    .attr("value", function(d) {return d.name})
    .html(function(d) {return d.name});

  select.on("change", function() {
    var selectedIndex = select.property("selectedIndex");
    var selectedPreset = options.filter(function(d,i) {return i == selectedIndex});
    $('#input-text').html(selectedPreset.datum().data);
    updateAndRestartButtonClick();
  });
}

function load_training_data() {
  input_pairs = [];  // global
  vocab = [];  // global
  current_input = null;  // global, when inactivate, should be null
  current_input_idx = -1;
  var input_text = $("#input-text").val();
  var pairs = input_text.trim().split(",")
  pairs.forEach(function(s) {
    tokens = s.trim().split("|");
    assert(tokens.length == 2, "Bad input format: " + s);
    tokens[0] = tokens[0].trim().split("^");  // input tokens
    tokens[1] = tokens[1].trim().split("^");  // output tokens
    input_pairs.push(tokens);
    tokens[0].forEach(function(t) {vocab.push(t)});
    tokens[1].forEach(function(t) {vocab.push(t)});
  });
  vocab = $.unique(vocab.sort());
}

// "context word" === "input word"
function isCurrentContextWord(w) {
  if (current_input == null) return;
  var context_words = current_input[0];
  if (context_words.length == 1) {
    return w == context_words[0];
  } else if (context_words.length > 1) {
    var matched = false;
    context_words.forEach(function(cw) {
      if (cw == w) {
        matched = true;
        return;
      }
    });
    return matched;
  }
  return false;
}

function isCurrentTargetWord(w) {
  if (current_input == null) return;
  var target_words = current_input[1];
  if (target_words.length == 1) {
    return w == target_words[0];
  } else if (target_words.length > 1) {
    var matched = false;
    target_words.forEach(function(tw) {
      if (tw == w) {
        matched = true;
        return;
      }
    });
    return matched;
  }
  return false;
}

// Regardless the value of current_input, forward to the next input
function activateNextInput() {
  current_input_idx = (current_input_idx + 1) % input_pairs.length;
  current_input = input_pairs[current_input_idx];
  inputNeurons.forEach(function(n, i) {
    n['value'] = isCurrentContextWord(n['word']) ? 1 : 0;
    n['always_excited'] = isCurrentContextWord(n['word']);
  });
  do_feed_forward();  // model
  update_neural_excite_value();  // visual
}

function deactivateCurrentInput() {
  current_input = null;
  inputNeurons.forEach(function(n, i) {
    // n['value'] = 0;
    n['always_excited'] = false;
  });
  do_feed_forward();  // model
  update_neural_excite_value();  // visual
}

function show_error(e) {
  console.log(e);
  var new_error = '<p>' + e + '</p>';
  $('#error').append(new_error);
  $('#error').show();
}

function setup_neural_net() {
  inputNeurons = [];  // global (same below)
  outputNeurons = [];
  hiddenNeurons = [];
  vocab.forEach(function(word, i) {
    inputNeurons.push({word: word, value: 0, idx: i});
    outputNeurons.push({word: word, value: 0, idx: i});
  });
  for (var j = 0; j < config_obj.hidden_size; j++) {
    hiddenNeurons.push({value: 0, idx: j});
  }

  vocabSize = vocab.length;
  hiddenSize = config_obj.hidden_size;
  inputEdges = [];
  outputEdges = [];
  inputVectors = [];  // keeps references to the same set of underlying objects as inputEdges
  outputVectors = [];
  seed_random(config_obj.random_state);  // vector_math.js
  for (var i = 0; i < vocabSize; i++) {
    var inVecTmp = [];
    var outVecTmp = [];
    for (var j = 0; j < hiddenSize; j++) {
      var inWeightTmp = {source: i, target: j, weight: get_random_init_weight(hiddenSize)};
      var outWeightTmp = {source: j, target: i, weight: get_random_init_weight(hiddenSize)};
      inputEdges.push(inWeightTmp);
      outputEdges.push(outWeightTmp);
      inVecTmp.push(inWeightTmp);
      outVecTmp.push(outWeightTmp);
    }
    inputVectors.push(inVecTmp);
    outputVectors.push(outVecTmp);
  }
}



function project(x, y) {
  var angle = (x - 90) / 180 * Math.PI, radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}


function setup_rm_hierarchy_svg() {
	
	
	
  nn_svg_width = 1400;  // view box, not physical
  nn_svg_height = 1000;  // W/H ratio should match padding-bottom in wevi.css
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

   /* Adding a colored svg background to help debug. */
  // svg.append("rect")
  //   .attr("width", "100%")
  //   .attr("height", "100%")
  //   .attr("fill", "#E8E8EE");

	
	//var nn_svg = d3.select("svg"),
    //width = +svg.attr("width"),
    //height = +svg.attr("height"),
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
	
	
	
	
  // Prepare for drawing arrows indicating inputs/outputs
 /* nn_svg.append('svg:defs')
    .append("svg:marker")
    .attr("id", "marker_arrow")
    .attr('markerHeight', 3.5)
    .attr('markerWidth', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('refX', 0)
    .attr('refY', 0)
    .attr('viewBox', '-5 -5 10 10')
    .append('svg:path')
      .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
      .attr('fill', io_arrow_color());
	  */
}

function update_neural_net_svg() {  
  var colors = ["#427DA8", "#6998BB", "#91B3CD", "#BAD0E0", 
                "#E1ECF3", "#FADEE0", "#F2B5BA", "#EA8B92", 
                "#E2636C", "#DB3B47"];
  numToColor = d3.scale.linear()
    .domain(d3.range(0, 1, 1 / (colors.length - 1)))
    .range(colors);  // global

  var inputNeuronCX = nn_svg_width * 0.2;
  var outputNeuronCX = nn_svg_width - inputNeuronCX;
  var ioNeuronCYMin = nn_svg_height * 0.125;
  var ioNeuronCYInt = (nn_svg_height - 2 * ioNeuronCYMin) / (vocabSize - 1 + 1e-6);
  var hiddenNeuronCX = nn_svg_width / 2;
  var hiddenNeuronCYMin = nn_svg_height * 0.15;
  var hiddenNeuronCYInt = (nn_svg_height - 2 * hiddenNeuronCYMin) / (hiddenSize - 1 + 1e-6);
  var neuronRadius = nn_svg_width * 0.015;
  var neuronLabelOffset = neuronRadius * 1.4;

  var inputNeuronElems = nn_svg
    .selectAll("g.input-neuron")
    .data(inputNeurons)
    .enter()
    .append("g")
    .classed("input-neuron", true)
    .classed("neuron", true);

  inputNeuronElems
    .append("circle")
    .attr("cx", inputNeuronCX)
    .attr("cy", function (d, i) {return ioNeuronCYMin + ioNeuronCYInt * i});

  inputNeuronElems
    .append("text")
    .classed("neuron-label", true)
    .attr("x", inputNeuronCX - neuronLabelOffset)
    .attr("y", function (d, i) {return ioNeuronCYMin + ioNeuronCYInt * i})
    .attr("text-anchor", "end");

  var outputNeuronElems = nn_svg
    .selectAll("g.output-neuron")
    .data(outputNeurons)
    .enter()
    .append("g")
    .classed("output-neuron", true)
    .classed("neuron", true);

  outputNeuronElems
    .append("circle")
    .attr("cx", outputNeuronCX)
    .attr("cy", function (d, i) {return ioNeuronCYMin + ioNeuronCYInt * i});

  outputNeuronElems
    .append("text")
    .classed("neuron-label", true)
    .attr("x", outputNeuronCX + neuronLabelOffset)
    .attr("y", function (d, i) {return ioNeuronCYMin + ioNeuronCYInt * i})
    .attr("text-anchor", "start");

  nn_svg.selectAll("g.hidden-neuron")
    .data(hiddenNeurons)
    .enter()
    .append("g")
    .classed("hidden-neuron", true)
    .classed("neuron", true)
    .append("circle")
    .attr("cx", hiddenNeuronCX)
    .attr("cy", function (d, i) {return hiddenNeuronCYMin + hiddenNeuronCYInt * i;});

  nn_svg.selectAll("g.neuron > circle")
    .attr("r", neuronRadius)
    .attr("stroke-width", "2")
    .attr("stroke", "grey")
    .attr("fill", function(d) {return numToColor(0.5);});

  nn_svg.selectAll(".neuron-label")
    .attr("alignment-baseline", "middle")
    .style("font-size", 24)
    .text(function(d) {return d.word});

  nn_svg.selectAll("g.input-edge")
    .data(inputEdges)
    .enter()
    .append("g")
    .classed("input-edge", true)
    .classed("edge", true)
    .append("line")
    .attr("x1", inputNeuronCX + neuronRadius)
    .attr("x2", hiddenNeuronCX - neuronRadius)
    .attr("y1", function (d) {return ioNeuronCYMin + ioNeuronCYInt * d['source']})
    .attr("y2", function (d) {return hiddenNeuronCYMin + hiddenNeuronCYInt * d['target']})
    .attr("stroke", function (d) {return getInputEdgeStrokeColor(d)})
    .attr("stroke-width", function (d) {return getInputEdgeStrokeWidth(d)});


  nn_svg.selectAll("g.output-edge")
    .data(outputEdges)
    .enter()
    .append("g")
    .classed("output-edge", true)
    .classed("edge", true)
    .append("line")
    .attr("x1", hiddenNeuronCX + neuronRadius)
    .attr("x2", outputNeuronCX - neuronRadius)
    .attr("y1", function (d) {return hiddenNeuronCYMin + hiddenNeuronCYInt * d['source']})
    .attr("y2", function (d) {return ioNeuronCYMin + ioNeuronCYInt * d['target']})
    .attr("stroke", function (d) {return getOutputEdgeStrokeColor(d)})
    .attr("stroke-width", function (d) {return getOutputEdgeStrokeWidth(d)});

  // This function needs to be here, because it needs to "see" ioNeuronCYMin and such...
  draw_input_output_arrows = function() {
    inputNeurons.forEach(function(n, neuronIdx) {
      if (isCurrentContextWord(n.word)) {
        nn_svg.append("line")
          .classed("nn-io-arrow", true)  // used for erasing
          .attr("x1", "0")
          .attr("y1", ioNeuronCYMin + ioNeuronCYInt * neuronIdx)
          .attr("x2", nn_svg_width * 0.075)
          .attr("y2", ioNeuronCYMin + ioNeuronCYInt * neuronIdx)
          .attr("marker-end", "url(#marker_arrow)")
          .style("stroke", io_arrow_color())
          .style("stroke-width", "10");
      }
    });
    outputNeurons.forEach(function(n, neuronIdx) {
      if (isCurrentTargetWord(n.word)) {
        nn_svg.append("line")
          .classed("nn-io-arrow", true)  // used for erasing
          .attr("x1", nn_svg_width)
          .attr("y1", ioNeuronCYMin + ioNeuronCYInt * neuronIdx)
          .attr("x2", nn_svg_width * (1-0.075))
          .attr("y2", ioNeuronCYMin + ioNeuronCYInt * neuronIdx)
          .attr("marker-end", "url(#marker_arrow)")
          .style("stroke", io_arrow_color())
          .style("stroke-width", "10");
      }
    });
  };

  // Set up hover behavior
  d3.selectAll(".input-neuron > circle")
    .on("mouseover", mouseHoverInputNeuron)
    .on("mouseout", mouseOutInputNeuron)
    .on("click", mouseClickInputNeuron);
}


function loadButtonClick() {
//<script type="text/javascript" src="https://apis.google.com/js/api.js?onload=loadPicker"></script>
loadPicker();
}

function preProcess(){
	
	
}















