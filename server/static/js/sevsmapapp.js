function draw(mapurl, initialColorBy, updateurl){

  var width = window.innerWidth,
      height = window.innerHeight;

  d3.json(mapurl, function(err, input) {
    if (err) throw err;

    var tj;
    if ('features' in input) {
        tj = topojson.topology(input.features);
        tj = topojson.presimplify(tj);
        geojson = topojson.feature( tj, tj.objects[0] ); // THIS WILL ONLY GET THE FIRST ITEM!!!!
                                                         // ....It also doesn't create a FeatureCOllection
                                                         //     object and will therefoe fail :(
    }
    else {
        tj = topojson.presimplify(input);
        geojson = topojson.feature( tj, tj.objects.primary );
    }
    var svg = d3.select(".app")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .on("click", stopped, true);

        g = svg.append("g")
        info = svg.append("text")
                  .attr("x", 10)
                  .attr("y", 25)
                  .text("-")

    // Determine a good projection to match the data
    var mapprojection = d3.geoMercator()
                          .fitExtent( [[0,0],[width,height]], geojson);
    
    var minZOriginal = 2/mapprojection.scale(), minZ = minZOriginal;
    
    tmp = mapprojection.invert([0,0])
    var top =tmp[1]
    var left=tmp[0]
    
    tmp = mapprojection.invert([width,height])
    var bot  =tmp[1]
    var right=tmp[0]

    var clipAndSimp = d3.geoTransform({point: function(x,y,z){ 
        if (y>top | y<bot | x<left |x>right){
            if (z>=100*minZOriginal){
                return this.stream.point(x,y);
            }
        } else {
            if (z>=minZ){
                return this.stream.point(x,y);
            }
        }
    }});
    
    var projection = {
          stream: function(s) {
            return clipAndSimp.stream(mapprojection.stream(s)); // WOOOOOW, javascript sucks...order is 
          }
        };


    // Make path mapper and create region instance
    path = d3.geoPath().projection(projection);

    region = g.selectAll("path")
              .data(geojson.features).enter()
              .append("path")
              .attr('id', d => "_index_"+d.properties._index)
              .on("mouseover", mouseover)
              .on("mouseout", mouseout)
              .on("click", dance)
              .attr("d", path);
    
    // Fill function
    function colorby(input) {
      var vals = geojson.features.map( d => +d.properties[input])
      var color = d3.scaleSequential(d3.interpolateRdBu)
                    .domain([Math.min(...vals), Math.max(...vals)]); 

      g.selectAll("path")
       .attr('fill', d => color(d.properties[input]));
    }
    colorby("_index");

    // Add zooming and dragging
    var zoom = d3.zoom().on("zoom", zoomed);

    var lastZoom = 1;
    var lastXO = 0;
    var lastYO = 0;

    var pad = 300
    function recalculatePoints(t) {
        if ((Math.abs(1-t.k/lastZoom) > -0.01)  | 
            ( Math.abs(t.x/t.k - lastXO) > pad) | 
            ( Math.abs(t.y/t.k - lastYO) > pad)) {

            k = Math.max(1, Math.min(100, t.k));
            // console.log(t.k, k);
            lastZoom=t.k;
            lastXO = t.x/t.k;
            lastYO = t.y/t.k;

            var tmp = mapprojection.invert([(-pad-t.x)/t.k, (-pad-t.y)/t.k,])
            left=tmp[0]
            top =tmp[1]

            var tmp = mapprojection.invert([(pad+width-t.x)/t.k, (pad+height-t.y)/t.k,])
            right=tmp[0]
            bot  =tmp[1]

            minZ = minZOriginal / k;

             g.selectAll("path").style("stroke-width", 1/k).attr("d", path);
        }
    }
    function zoomed(d) {
      var t = d3.event.transform;
      
      g.attr("transform", d3.event.transform);
      recalculatePoints(t);
    }

    svg.call(zoom);

    // Mouseover functions
    d3.selection.prototype.moveToFront = function() {  
          return this.each(function(){
            this.parentNode.appendChild(this);
          });
        };

    function mouseover(d){
      info.text("");
      for (var p in d.properties){
        if (d.properties.hasOwnProperty(p)){
          var s = p + ": " + d.properties[p];
          info.append("tspan")
              .attr("x",0)
              .attr("dy","1.2em")
              .text(p+":")
              .on("click", function() {
                colorby(d3.select(this).text().slice(0,-1))
              });
          
          info.append("tspan")
              .attr("x", 0)
              .attr("dx", "6.5em")
              .text(d.properties[p]);
        }
      }

      d3.select(this)
        .moveToFront()
        .transition("selecting")        
        .duration(200)      
        .style("stroke", '#DDa0a0')
        .style("stroke-width", 3/lastZoom);
    }
    function mouseout(d){
        d3.select(this)
        .transition("deselecting")        
        .duration(1500)      
        .style("stroke", "black")
        .style("stroke-width", 1/lastZoom);
    }
    function dance(d){
        d3.select(this)
          .transition("dancing").duration(100).attr("transform", "translate(5,0)")
          .transition().duration(200).attr("transform", "translate(-5,0)")
          .transition().duration(100).attr("transform", "translate(0,0)")
    }

    // Update the geo data if we need to
    if(updateurl !== undefined) { 
      d3.json(updateurl, function(err, updatedata) {
        if (err) throw err;
        VAR=updatedata;
        Object.entries(updatedata).forEach(function (row) {
          var geom = geojson.features[ row[1].index ] 

          Object.entries(row[1]).forEach(function (value) {
            if (value[0]!='index') {
              geom.properties[value[0]] = value[1];
            }
          });
        });

        // Recolor after update?
        if (initialColorBy!="_index") colorby(initialColorBy);

      });
    }
  })
}



// If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  }