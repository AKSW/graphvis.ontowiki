(function(){
    // config
    var m = [20, 120, 20, 120],
        w = (window.innerWidth - 350) - m[1] - m[3],
        h = (window.innerHeight - 50) - m[0] - m[2],
        i = 0,
        duration = 500,
        tree, vis, diagonal,
        root;

    var createTree = function(){
        tree = d3.layout.tree()
            .size([h, w]);

        diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        vis = d3.select("#chart").append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
          .append("g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        root = $.parseJSON(treeData);
        root.x0 = h / 2;
        root.y0 = 0;

        function collapse(d) {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
          }else{
            d.loaded = false;
          }
        }

        root.children.forEach(collapse);
        updateTree(root);
    }

    function updateTree(root) {
      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse();

      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * 180; });

      // Update the nodes…
      var node = vis.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
          .on("click", clickTree);

      nodeEnter.append("circle")
          .attr("r", 1e-6)
          .style("fill", color);

      nodeEnter.append("text")
          .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
          .attr("dy", ".35em")
          .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
          .text(function(d) { return d.name; })
          .style("fill-opacity", 1e-6);

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      nodeUpdate.select("circle")
          .attr("r", 4.5)
          .style("fill", color);

      nodeUpdate.select("text")
          .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
          .remove();

      nodeExit.select("circle")
          .attr("r", 1e-6);

      nodeExit.select("text")
          .style("fill-opacity", 1e-6);

      // Update the links…
      var link = vis.selectAll("path.link")
          .data(tree.links(nodes), function(d) { return d.target.id; });

      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        })
        .style("stroke", function(d){
            if(typeof d.relation == 'undefined' ) return "#000000";
            return "#"+stringToColor(d.relation).substr(0,6);
        })
        .transition()
          .duration(duration)
          .attr("d", diagonal);

      // Transition links to their new position.
      link.transition()
          .duration(duration)
          .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          })
          .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Toggle children on click.
    function clickTree(d) {
      if(d.loaded === true){
           if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        updateTree(d);
      }else if(d.loaded === false){
        var uri = d.uri;
        $.getJSON(urlBase+'graphvis/getchildren/?uri='+uri, function(data){
            d.children = data.children;
            d.children.forEach(function(c){c.loaded = false});
            d.loaded = true;
            updateTree(d);
        });
      }
    }

    // Color leaf nodes orange, and packages white or blue.
    function color(d) {
        if( d.class == null || d.class.length < 2 ) return "#FFFFFF";
        var color = "#"+stringToColor(d.class).substr(0,6);

        if( typeof classesList[d.class] == 'undefined' ){
            classesList[d.class] = color;
        }

        return color;
        //return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
    }

    $('.relationFilter').live('click', function(){
        if( tree != null ){
            var rel = $(this).attr('data-uri');

            if( rel == "clear_all_filters" ){
                updateTree(root);
            }else{
                var froot = {};
                froot.children = filterChildren(root, rel);
                froot.id = root.id;
                froot.name = root.name;
                froot.x0 = h / 2;
                froot.y0 = 0;

                updateTree(froot);
            }
        }
    });

    function filterChildren(element, rel){
        var results = [];

        for(var i in element.children){
            if(element.children[i].relation == rel){
                results.push(element.children[i]);
            }
            if(element.children[i].children != null && element.children[i].children.length > 0){
                results = results.concat(filterChildren(element.children[i]));
            }
        }

        return results;
    }

    var destroyTree = function(){
        tree = null;
    }


    window.createTree = createTree;
    window.destroyTree = destroyTree;
})(window);