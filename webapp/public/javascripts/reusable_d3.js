// Reusable D3 Module
// Author: SeokChan Yoo
// Date: April 17 2016
// Reference: Mike Bostock's "Towards Reusable Charts"

// Sample JSON chart dataset

/*
 * Define line graph
 */

 function prettyline() {
   // Default settings for reuse
   var $el = d3.select("#graph")
   var color = "darkcyan";
   var color2 = "lightsalmon";
   var margin = {top:50, right:50, bottom:50, left:50};
   var width = 500 - margin.left - margin.right;
   var height = 400 - margin.top - margin.bottom;
   var svg, y, xAxis, yAxis, impedance, phase;
   var navWidth = width;
   var navHeight = 100 -margin.top - margin.bottom;

   var seokchan = {};

  //console.log(chartData);
  //console.log(chartData.length);

  // Method for render/refresh graph
  seokchan.render = function(){
    // First time Rendering
    if(!svg){

      // Scaling x range
      var x = d3.scale.log()
      .domain([[0, d3.max(chartData, function(d) {
      return d.f;
      })]])
        .range([0, width]);

      // Scaling y range
      var y = d3.scale.linear()
    		.domain([d3.min(chartData, function(d){
          return d.z;
        }), d3.max(chartData, function(d) {
    		return d.z;
    		})])
    		.range([height, 0]);        // y range as a log (If needed)

      var y2 = d3.scale.linear()
              			.domain([d3.min(chartData, function(d) {
              			return d.phi;}), d3.max(chartData, function(d) {
              			return d.phi;
              			})])
              			.range([height, 0]);

      /*
       *  Define the axis
       */

      function x_axis() {
           return d3.svg.axis()
        		        .scale(x)
        		        .orient("bottom")
                    .ticks(5);
          }

      function y_axis() {
            return d3.svg.axis()
          		       .scale(y)
          		         .orient("left")
          		           .tickFormat(function(d) {
          			              return y.tickFormat(5, d3.format(",d"))(d);
          		            })
                         .ticks(10);
            }

      var y_axis2 = d3.svg.axis()
                      		.scale(y2)
                      		.orient("right")
                      		.tickFormat(function(d) {
                      			return y2.tickFormat(5, d3.format(",d"))(d);
                      		});


      /*
       *  Define the line (Impedance curve and Phase curve)
       */

      var impedance = d3.svg.line()
          		.x(function(d) {
          			return x(d.f);

          		})
          		.y(function(d) {
          			return y(d.z);
          		})
              .interpolate("linear");

      var phase = d3.svg.line()
          		.x(function(d) {
          			return x(d.f);
          		})
          		.y(function(d) {
          			return y2(d.phi);
          		});


      // Define svg canvas with margin setup
      var svg = $el.append("svg:svg")
        .attr("viewBox", "0 0 600 450")
        .attr("preserveAspectRatio", "xMinYMin meet")
    		.append("svg:g")
    		.attr("transform", "translate(" + margin.left + ", " + margin.top +")");

      // Scale the range of the data (Impedance)
       x.domain(d3.extent(chartData, function(d) {
      		return d.f;
      	}));
       y.domain([0, d3.max(chartData, function(d) {
      		return d.z;
      	})]);

    /*
     *  Call X & Y Axes on the right location
     */

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, "+ height+ ")")
      .call(x_axis());

    svg.append("g")
			.attr("class", "y axis")
			.call(y_axis());

    svg.append("g")
			.attr("class", "y axis")
      .attr("transform", "translate(" + width + " ,0)")
			.call(y_axis2);

    /*
     *   Grid line generation
     */

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0, "+ height+ ")")
      .call(x_axis().tickSize(-height,0,0).tickFormat(""));

    svg.append("g")
        .attr("class", "grid")
        .call(y_axis().tickSize(-width,0,0).tickFormat(""));

    /*
     *   Labeling axis title
     */

     // text label for the x axis
     svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 12) + ")")
        .style("text-anchor", "middle")
        .text("Frequency (Hz)");

     // text label for the impedance y axis
     svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy", "1em")
                .attr("y", 0 - margin.left)
                .attr("x",0 - (height / 2))
                .style("text-anchor", "middle")
                .text("Impedance (ohms)");

    // text label for the phase y axis
     svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy", "1em")
                .attr("y", width + margin.left - 25)
                .attr("x",0 - (height / 2))
                .style("text-anchor", "middle")
                .text("Phase (rad)");

    /*
     *   Draw a path line graph on the svg canvas
     */
  path =  svg.append("path")
       .attr("class", "line")
       .attr("stroke", color)
       .attr("d", impedance(chartData));

  path2 =  svg.append("path")
          .attr("class", "line")
          .attr("stroke", color2)
          .attr("opacity",0.6)
          .attr("d", phase(chartData));

  /*
   *   Line graph Transition
   */
   var totalLength = path.node().getTotalLength();
   var totalLength2 = path2.node().getTotalLength();

          path
             .attr("stroke-dasharray", totalLength + " " + totalLength)
             .attr("stroke-dashoffset", totalLength)
             .transition()
             .duration(950)
             .ease("linear")
             .attr("stroke-dashoffset", 0);

          path2
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(950)
            .ease("linear")
            .attr("stroke-dashoffset", 0);


    /*
     *   Add points to line
     */

    // Impedance line points + Tooltips
    svg.selectAll(".dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("r",3.5)
      .attr("cx", function(d) { return x(d.f)})
      .attr("cy", function(d) { return y(d.z)})
      .attr("fill", "darkcyan")
      .on("mouseover", function(d){
    // Pretty points transition on mouse hover.
        d3.select(this)
        .transition()
        .duration(300)
        .attr("r", 5.0)
        .attr("fill","white")
        .attr("stroke", "darkcyan")
        .attr("stroke-width", 2);

        div.transition()
        .duration(100)
        .style("opacity", 0.9);
        div .html("Frequency:" + "&nbsp" + d.f.toLocaleString() +"&nbsp" + "Hz" +"</br>" + "Impedance:" +"&nbsp" + d.z.toLocaleString() + "&nbsp" + "Ohms")
        .style("left", (d3.event.pageX - 55) + "px")
        .style("top", (d3.event.pageY - 45) + "px");
      })
      .on("mouseout", function(d){
        // Pretty points transition on mouse out.
        d3.select(this)
          .transition()
          .duration(300)
          .attr("r", 3.5)
          .attr("fill", "darkcyan");

        div.transition()
        .duration(100)
        .style("opacity", 0);
      });

    // Phase line points with Tooltips
      svg.selectAll("dot2")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("r",3.5)
        .attr("cx", function(d) { return x(d.f)})
        .attr("cy", function(d) { return y2(d.phi)})
        .attr("fill", "lightsalmon")
        .attr("opacity",0.6)
        .on("mouseover", function(d){
          d3.select(this)
          .transition()
          .duration(300)
          .attr("r", 5.0)
          .attr("fill","white")
          .attr("stroke", "lightsalmon")
          .attr("stroke-width", 2);

          div.transition()
          .duration(100)
          .style("opacity", 0.9);
          div.html("Frequency:" + "&nbsp" + d.f.toLocaleString() +"&nbsp" + "Hz" +"</br>" + "Phase:" +"&nbsp" + d.phi.toLocaleString() + "&nbsp" + "Rad")
          .style("left", (d3.event.pageX - 55) + "px")         // The mouse position relative to the left edge of the document.
          .style("top", (d3.event.pageY - 45) + "px");         // The mouse position relative to the top edge of the document.
        })
        .on("mouseout", function(d){
          d3.select(this)
            .transition()
            .duration(300)
            .attr("r", 3.5)
            .attr("fill", "lightsalmon");

          div.transition()
          .duration(100)
          .style("opcaity", 0);
        });

    /*
     *   Adding Responsive Legends using d3.svg.legend library
     */
         legendsName = ["Impedance","Phase"]
         legendColor = d3.scale.ordinal().domain(legendsName).range(["darkcyan","lightsalmon"]);

         verticalLegend = d3.svg.legend().labelFormat("none").cellPadding(5).orientation("vertical").units("Legends").cellWidth(25).cellHeight(18).inputScale(legendColor).cellStepping(10);

         d3.select("svg").append("g").attr("transform", "translate(450,40)").attr("class", "legend").call(verticalLegend);

    // Define 'div' for tooltips
         var div = d3.select("body")
         	.append("div")  // declare the tooltip div
         	.attr("class", "tooltip")              // apply the 'tooltip' class
         	.style("opacity", 0);                  // set the opacity to nil


}
    // Else case for refreshing/updating chartdata and plot
    else{
      seokchan.data(chartData);

      // Re-Scale the range of the x & y (Impedance)
      	x.domain(d3.extent(chartData, function(d) {
      		return d.f;
      	}));
      	y.domain([0, d3.max(chartData, function(d) {
      		return d.z;
      	})]);

      // Refreshing x and y axis change with transition
      svg.select("g.y")
        .transition()
        .duration(1000)
        .call(yAxis);

      svg.select("g.x")
        .transition()
        .duration(1000)
        .call(xAxis);

      svg.selectAll("path.line")
         .transition()
         .duration(1000)
         .attr("d", impedance(chartData));
    }
    return seokchan;
  }

  // Getter and Setter Constructor Methods
  // Keep local variables not destroyed, and not open to public (default)
  // Closure is formed

  seokchan.$el = function(value){
    if (!arguments.length) return $el;
    $el = value;
    return seokchan;
  };
/*
  seokchan.width = function(value){
    if (!arguments.length) return width;
    width = value;
    return seokchan;
  };

  seokchan.height = function(value){
    if (!arguments.length) return height;
    height = value;
    return seokchan;
  };
*/
  seokchan.color = function(value){
    if (!arguments.length) return color;
    color = value;
    return seokchan;
  };
  seokchan.color2 = function(value){
    if (!arguments.length) return color2;
    color2 = value;
    return seokchan;
  }
  return seokchan;
};
