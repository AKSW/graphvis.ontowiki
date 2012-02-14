(function(){
    var w = (window.innerWidth - 350),
        h = (window.innerHeight - 50),
        vis,
        force,
        nodes, links,
        node, link, text,
        root;

    var createGraph = function(){
        force = d3.layout.force()
            .size([w, h])
            .linkDistance(function(d) { return d.target._children ? 120 : 200; })
            .charge(function(d) { return d._children ? -d.size / -300 : -300; })
            .on("tick", tick);

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
        root.fixed = true;
        root.x = w / 2;
        root.y = h / 2;

        links = $.parseJSON(graphData);
        nodes = {};
        // Compute the distinct nodes from the links.
        links.forEach(function(l) {
          l.source = nodes[l.source] || (nodes[l.source] = {name: l.source, uri:l.sourceUri, class:l.class, classLabel: l.classLabel});
          l.target = nodes[l.target] || (nodes[l.target] = {name: l.target, uri:l.targetUri, class:l.class, classLabel: l.classLabel});
        });

        updateGraph(nodes, links);
    } // end createGraph

    function updateGraph(nodes, links){
        $("#chart svg g").remove();

        // create force layout.
        force
            .nodes(d3.values(nodes))
            .links(links);

        // Update the links…
        link = vis.append("g").selectAll("path")
            .data(force.links());

        // Enter any new links.
        link.enter().append("path")
            .attr("class", "link")
            .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
            .style("stroke", function(d){
                if(typeof d.relation == 'undefined' ) return "#000000";
                return "#"+stringToColor(d.relation).substr(0,6);
            });

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

        force.start();
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
        if( d.class == null || d.class.length < 2 ) return "#FFFFFF";
        var color = "#"+stringToColor(d.class).substr(0,6);

        if( typeof classesList[d.classLabel] == 'undefined' ){
            classesList[d.classLabel] = color;
        }

        return color;
        //return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
    }

    // Toggle children on click.
    function click(d) {
        var uri = d.uri;
        var name = d.name;
        $.getJSON(urlBase+'graphvis/getrelations/?uri='+uri, function(data){
            if(data.length > 0){
                data.forEach(function(l) {
                  l.source = nodes[name] || (nodes[name] = {name: name, uri:uri, class:l.class, classLabel: l.classLabel});
                  l.target = nodes[l.target] || (nodes[l.target] = {name: l.target, uri:l.targetUri, class:l.class, classLabel: l.classLabel});
                });
                links = links.concat(data);
                updateGraph(nodes, links);
            }
        });
    }

    // filter on click
    $('.relationFilter').live('click', function(){
        if( force != null ){
            var rel = $(this).attr('data-uri');

            if( rel == "clear_all_filters" ){
                updateGraph(nodes, links);
            }else{
                var fnodes = {};
                var flinks = [];
                var l;
                for(var i in links){
                    if(links[i].relation == rel){
                        l = links[i];
                        if( typeof fnodes[l.source.name] == 'undefined' ){
                            fnodes[l.source.name] = {name: l.source.name, uri:l.sourceUri, class:l.class, classLabel: l.classLabel};
                        }
                        if( typeof fnodes[l.target.name] == 'undefined' ){
                            fnodes[l.target.name] = {name: l.target.name, uri:l.targetUri, class:l.class, classLabel: l.classLabel};
                        }
                        flinks.push({
                            source: fnodes[l.source.name],
                            target: fnodes[l.target.name]
                        });

                    }
                }
                updateGraph(fnodes, flinks);
            }
        }
    });

    var destroyGraph = function(){
        force = null;
    }

    window.createGraph = createGraph;
    window.destroyGraph = destroyGraph;
})(window)