(function(){ 
	var w = 1280,
	    h = 800,
		force,
		vis,
	    node,
	    link,
		text,
	    root;
	
	var createGraph = function(){
		force = d3.layout.force()
		    .size([w, h])
		    .linkDistance(function(d) { return d.target._children ? 120 : 100; })
		    .charge(function(d) { return d._children ? -d.size / -400 : -300; })
			.on("tick", tick)
		    .start();

		vis = d3.select("#chart").append("svg")
		    .attr("width", w)
		    .attr("height", h);
		
		// Per-type markers, as they don't inherit styles.
		vis.append("defs").selectAll("marker")
			.data(["suit", "licensing", "resolved"])
			.enter().append("marker")
			.attr("id", String)
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)
			.attr("refY", -1.5)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-5L10,0L0,5");
		
		root = {};
		root.data = $.parseJSON(graphData);
		root.fixed = true;
		root.x = w / 2;
		root.y = h / 2;
		
		updateGraph();
	} // end createGraph
	
	function updateGraph(){
		var nodes = {};
		var links = root.data;
		// Compute the distinct nodes from the links.
		links.forEach(function(l) {
		  l.source = nodes[l.source] || (nodes[l.source] = {name: l.source});
		  l.target = nodes[l.target] || (nodes[l.target] = {name: l.target});
		});
		
		// Restart the force layout.
		force
			.nodes(d3.values(nodes))
		    .links(links)
		    .start();
		
		// Update the links…
		link = vis.append("g").selectAll("path")
		    .data(force.links());

		// Enter any new links.
		link.enter().append("path")
			.attr("class", function(d) { return "link " + d.type; })
			.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

		 // Exit any old links.
		 link.exit().remove();

		 // Update the nodes…
		 node = vis.append("g").selectAll("circle")
		 	.data(force.nodes())
		    .style("fill", color);

		 node.transition()
		 	.attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; });

		 // Enter any new nodes.
		 node.enter().append("circle")
		    .attr("class", "node")
		    .attr("r", 6)
		    .style("fill", color)
		    .on("click", click)
		    .call(force.drag);

		 // Exit any old nodes.
		 node.exit().remove();
		
		 text = vis.append("g").selectAll("g")
		     .data(force.nodes())
		   	 .enter().append("g");

		 // A copy of the text with a thick white stroke for legibility.
		 text.append("text")
		     .attr("x", 8)
		     .attr("y", ".31em")
		     .attr("class", "shadow")
		     .text(function(d) { return d.name; });

		text.exit().remove();
	} // end updateGraph
	
	// Use elliptical arc path segments to doubly-encode directionality.
	function tick() {
		link.attr("d", function(d) {
			var dx = d.target.x - d.source.x,
		        dy = d.target.y - d.source.y,
		        dr = Math.sqrt(dx * dx + dy * dy);
			return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		});

	    node.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		text.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	}
	
	// Color leaf nodes orange, and packages white or blue.
	function color(d) {
	  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	}

	// Toggle children on click.
	function click(d) {
	  if (d.children) {
	    d._children = d.children;
	    d.children = null;
	  } else {
	    d.children = d._children;
	    d._children = null;
	  }
	  update();
	}
	
	window.createGraph = createGraph;
})(window)