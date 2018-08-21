queue()
    .defer(d3.json, "/api/profile")
    .await(makeProfile);

function makeProfile(error, apiData) {
console.log("start make graphs");
	
//Start Transformations
    var totalNum = 0
	var dataSet = apiData;
	var dateFormat = d3.time.format("%YYYY-%m-%dd");
	var YdateFormat = d3.time.format("%H");
	var MILE_AGE_SCOPE=20

	dataSet.forEach(function(d) {
//		d.date = dateFormat.parse(d.date);
//		d.date.setDate(1);
//        d.departure_timestamp = new Date(d.departure_timestamp);
		totalNum = totalNum+1;

	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Select date from dropdown box
	var date = ndx.dimension(function(d){return d.fake_date;});
	var dateGroup = date.group();

    //Select date
	selectField = dc.selectMenu('#menuselect')
            .dimension(date)
            .group(dateGroup);

    //Select city
    var city = ndx.dimension(function(d){return d.departure_city});
    var cityGroup = city.group();
	selectField = dc.selectMenu('#cityselect')
            .dimension(city)
            .group(cityGroup);

    //Vehicle count
    var all = ndx.groupAll();
    var totalProjects = dc.numberDisplay("#total-projects");
    totalProjects
    		.formatNumber(d3.format("d"))
    		.valueAccessor(function(d){return d; })
    		.group(all);

    //Departure chart
    var monthDimension = ndx.dimension(function(d) {return d3.time.day(new Date(d.departure_timestamp)); }),

        arrivalDimension = ndx.dimension(function(d) {return d3.time.day(new Date(d.departure_timestamp)); }),

        departureGroup = monthDimension.group().reduce(
            function(p,v) {
//            console.log(d3.time.minute(new Date(v.departure_timestamp)));
              p.push(YdateFormat(d3.time.hour(new Date(v.departure_timestamp))));
              return p;
            },
            function(p,v) {
//            console.log(p);
              p.splice(p.indexOf(YdateFormat(d3.time.hour(new Date(v.departure_timestamp)))), 1);
              return p;
            },
            function() {
              return [];
            }
          ),

      arrivalGroup = monthDimension.group().reduce(
                  function(p,v) {
//                  console.log(d3.time.minute(new Date(v.arrival_timestamp)));
                    p.push(YdateFormat(d3.time.hour(new Date(v.arrival_timestamp))));
                    return p;
                  },
                  function(p,v) {
//                  console.log(p);
                    p.splice(p.indexOf(YdateFormat(d3.time.hour(new Date(v.arrival_timestamp)))), 1);
                    return p;
                  },
                  function() {
                    return [];
                  }
                );

    var chart = dc.boxPlot("#date-chart");
        var minDate = monthDimension.bottom(1)[0].departure_timestamp;
        console.log("min_Date:"+minDate)
        var maxDate = monthDimension.top(1)[0].departure_timestamp;
        console.log("max_Date:"+maxDate)
    chart
//        .width(768)
        .height(220)
        .margins({top: 20, right: 20, bottom: 20, left: 20})
        .dimension(monthDimension)
        .group(departureGroup)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .round(d3.time.week.round)
        .xUnits(d3.time.days)
        .elasticY(false)
        .elasticX(true)
        .xAxisPadding('1%')
        .y(d3.time.scale().domain([0, 24]));

    var arrival_chart = dc.boxPlot("#date2-chart");
        var minDate = arrivalDimension.bottom(1)[0].arrival_timestamp;
        console.log("min_Date:"+minDate)
        var maxDate = arrivalDimension.top(1)[0].arrival_timestamp;
        console.log("max_Date:"+maxDate)
    arrival_chart
//        .width(768)
        .height(220)
        .margins({top: 20, right: 20, bottom: 20, left: 20})
        .dimension(arrivalDimension)
        .group(arrivalGroup)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .round(d3.time.week.round)
        .xUnits(d3.time.days)
        .elasticY(false)
        .elasticX(true)
        .xAxisPadding('1%')
        .y(d3.time.scale().domain([0, 24]));
   // this demonstrates solving elasticX manually, avoiding the
   // bug where the rightmost bar/box is not displayed, #792
   function calc_domain(chart) {
       var min = d3.min(chart.group().all(), function(kv) { return kv.key; }),
           max = d3.max(chart.group().all(), function(kv) { return kv.key; });
//       max = d3.time.day.offset(max, 1);
       chart.x().domain([min, max]);
//       chart.xAxis().tickFormat(d3.time.format('%m%d'));
   }
   chart.on('preRender', calc_domain);
   chart.on('preRedraw', calc_domain);
//   chart.boxWidth(10);

   arrival_chart.on('preRender', calc_domain);
   arrival_chart.on('preRedraw', calc_domain);
//   arrival_chart.boxWidth(10);

    //Car type
    var ct = ndx.dimension(function(d) { return d.car_type; });
    var ctGroup = ct.group();
    var carTypeChart = dc.pieChart("#funding-chart");
    carTypeChart
                .height(350)
                //.width(350)
                .radius(90)
                .innerRadius(40)
                .transitionDuration(1000)
                .dimension(ct)
                .group(ctGroup);

    //Total vehicles
    var ndx2 = crossfilter(dataSet);
    var total_vehicles = dc.numberDisplay("#net-donations");
    var total_sum = ndx2.groupAll();
    total_vehicles
    		.formatNumber(d3.format("d"))
    		.valueAccessor(function(d){return d; })
    		.group(total_sum)
    		.formatNumber(d3.format("s"));

    //Reset all
    dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


    //Create map chart
    var width = 960, height = 350;
    var svg = d3.select("#map-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

        //创建投影(projection)
        var projection = d3.geo.mercator().translate([width / 2, height / 2]).center([105, 38]).scale(400);

        //创建path
        var path = d3.geo.path().projection(projection);

        //解析json
        d3.json("china.geo.json", function(json) {

            svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .on('mouseover', function(data) {
                        d3.select(this).attr('fill', 'rgba(2,2,139,0.61)');
                        })

                    .on('mouseout', function(data) {
                        d3.select(this).attr('fill', 'rgba(128,124,139,0.61)');
                        //Remove the tooltip
                        d3.select("#tooltip1").remove();
                        d3.select("#tooltip2").remove();
                    })
//                    .on('click', function(data) {
//                                           d3.event.stopPropagation();
//                                        })
                    .attr('fill', 'rgba(128,124,139,0.61)')
                    .attr('stroke', 'rgba(255,255,255,1)')
                    .attr('stroke-width', 1)
            ;
        });
        d3.selection.prototype.moveToFront = function() {
              return this.each(function(){
                this.parentNode.appendChild(this);
              });
            };
            d3.selection.prototype.moveToBack = function() {
                return this.each(function() {
                console.log(svg);
                    var firstChild = this.parentNode.firstChild;
                    if (firstChild) {
                        this.parentNode.insertBefore(this, firstChild);
                    }
                });
            };
            console.log(svg);

    // Create overlay chart
    var chinaChart = dc.bubbleOverlay("#map-chart")
                .svg(d3.select("#map-chart svg"));
    var city2 = ndx.dimension(function(d) {return d.departure_city; });
    var cityGroup2 = city2.group();
    chinaChart.width(960)
                              .height(350)
                              .dimension(city2)
                              .group(cityGroup2)
                              .radiusValueAccessor(function(p) {
                                  return p.value;
                              })
                              .r(d3.scale.linear().domain([0, 10000]))
                              .colors(["#ff7373","#ff4040","#ff0000","#bf3030","#a60000"])
                              .colorDomain([13, 30])
                              .colorAccessor(function(p) {
//                              console.log(p);
                                  return Math.floor(p.value);
//                                    return "#ff00ff";
                              })
                              .title(function(d) {
                                  return "City: " + d.key;
                              })
                              .point("北京", 560.5, 149)
                              .point("上海", 586.5, 234)
                              .debug(false);

    dc.renderAll();
};