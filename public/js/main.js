queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
console.log("start make graphs");

//Start Transformations
    var totalNum = 0
	var dataSet = apiData;
	var dateFormat = d3.time.format("%YYYY-%m-%dd");
	var MILE_AGE_SCOPE=20

	dataSet.forEach(function(d) {
//		d.date = dateFormat.parse(d.date);
//		d.date.setDate(1);
		totalNum = totalNum+1;
		d.mileStage = Math.floor(d.sum_mileage/MILE_AGE_SCOPE);
	});


     //Create a Crossfilter instance
     	var ndx = crossfilter(dataSet);

     	//Select date from dropdown box
     	var date = ndx.dimension(function(d) { return d.date; });
     	var dateGroup = date.group().reduce(
                 function (p, d) {
                     if( d.vin in p.vins)
                         p.vins[d.vin]++;
                     else p.vins[d.vin] = 1;
                     return p;
                 },

                 function (p, d) {
                     p.vins[d.vin]--;
                     if(p.vins[d.vin] === 0)
                         delete p.vins[d.vin];
                     return p;
                 },

                 function () {
                     return {vins: {}};
                 });

        //Select date
     	selectField = dc.selectMenu('#menuselect')
                 .dimension(date)
                 .valueAccessor(function(p) { return Object.keys(p.value.vins).length;})
                 .group(dateGroup);

         //Select car type
     	var carTypeDimension = ndx.dimension(function(d) { return d.car_type; });
     	var carTypeGroup = carTypeDimension.group().reduce(
                 function (p, d) {
                     if( d.vin in p.vins)
                         p.vins[d.vin]++;
                     else p.vins[d.vin] = 1;
                     return p;
                 },

                 function (p, d) {
                     p.vins[d.vin]--;
                     if(p.vins[d.vin] === 0)
                         delete p.vins[d.vin];
                     return p;
                 },

                 function () {
                     return {vins: {}};
                 });

        //Select car series
     	carTypeField = dc.selectMenu('#typeselect')
                 .dimension(carTypeDimension)
                 .valueAccessor(function(p) { return Object.keys(p.value.vins).length;})
                 .group(carTypeGroup);

        //Select city
        var city = ndx.dimension(function(d) { return d.city; })
        cityGroup = city.group().reduce(
                function (p, d) {
                    if( d.vin in p.vins)
                        p.vins[d.vin]++;
                    else p.vins[d.vin] = 1;
                    return p;
                },

                function (p, d) {
                    p.vins[d.vin]--;
                    if(p.vins[d.vin] === 0)
                        delete p.vins[d.vin];
                    return p;
                },

                function () {
                    return {vins: {}};
                });
        selectField = dc.selectMenu('#cityselect')
                .dimension(city)
                .valueAccessor(function(p) { return Object.keys(p.value.vins).length;})
                .group(cityGroup);

        //Vehicle count
        var all = ndx.groupAll();
        var vc = ndx.dimension(function(d) { return d.vin; });
        var vcGroup = vc.groupAll().reduce(
        function (p, d) {
                        if( d.vin in p.vins)
                            p.vins[d.vin]++;
                        else p.vins[d.vin] = 1;
                        return p;
                    },

                    function (p, d) {
                        p.vins[d.vin]--;
                        if(p.vins[d.vin] === 0)
                            delete p.vins[d.vin];
                        return p;
                    },

                    function () {
                        return {vins: {}};
                    }
        )
        var totalProjects = dc.numberDisplay("#total-projects");
        totalProjects
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d){return Object.keys(d.vins).length; })
                .group(vcGroup);

        //Total vehicles
        var ndx2 = crossfilter(dataSet);
        var total_vehicles = dc.numberDisplay("#net-donations");
        var total_sum = ndx2.groupAll().reduce(
            function (p, d) {
                            if( d.vin in p.vins)
                                p.vins[d.vin]++;
                            else p.vins[d.vin] = 1;
                            return p;
                        },

                        function (p, d) {
                            p.vins[d.vin]--;
                            if(p.vins[d.vin] === 0)
                                delete p.vins[d.vin];
                            return p;
                        },

                        function () {
                            return {vins: {}};
                        }
            )
        total_vehicles
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d){return Object.keys(d.vins).length; })
                .group(total_sum)
                .formatNumber(d3.format("s"));

        //Reset all
        dc.dataCount("#row-selection")
            .dimension(ndx)
            .group(all);


    //Timestamp select vehicle number
    var ts = ndx.dimension(function(d) { return d.start_timestamp; });
    var tsGroup = ts.group();
    var dateChart = dc.lineChart("#date-chart");
    var minDate = ts.bottom(1)[0].start_timestamp;
    console.log("min_Date:"+minDate)
    var maxDate = ts.top(1)[0].start_timestamp;
    console.log("max_Date:"+maxDate)
    dateChart
    		//.width(600)
    		.height(220)
    		.margins({top: 10, right: 20, bottom: 30, left: 40})
    		.dimension(ts)
    		.group(tsGroup)
    		.renderArea(true)
    		.transitionDuration(500)
    		.x(d3.time.scale().domain([minDate, maxDate]))
    		.elasticY(true)
    		.renderHorizontalGridLines(true)
        	.renderVerticalGridLines(true)
    		.xAxisLabel("Time")
    		.yAxisLabel("Vehicles")
    		.yAxis().ticks(5);

    //Car type
    var ct = ndx.dimension(function(d) { return d.car_type; });
    var ctGroup = ct.group();
    var carTypeChart = dc.pieChart("#funding-chart");
    carTypeChart
                .height(220)
                //.width(350)
                .radius(90)
                .innerRadius(40)
                .transitionDuration(1000)
                .dimension(ct)
                .group(ctGroup);


      //Avg speed
      var avg_dimension = ndx.dimension(function(d) { return d; });
      var avg_total = avg_dimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);

      function reduceAdd(p, v) {
        ++p.count;
        p.total += v.avg_speed;

        return p;
      }

      function reduceRemove(p, v) {
        --p.count;
        p.total -= v.avg_speed;
        return p;
      }

      function reduceInitial() {
        return {count: 0, total: 0};
      }

    var avgSpeed = dc.gaugeChart("#state-donations");
       avgSpeed.height(220)
       		.margins({top: 10, right: 10, bottom: 30, left: 10})
       		.valueAccessor(function(p) { return p.value.count > 0 ? p.value.total / p.value.count : 0; })
       		.dimension(avg_dimension)
            .group(avg_total);

    //Service usage
    function regroup(dim, cols, removed_prefix) {
        var _groupAll = dim.groupAll().reduce(
            function(p, v) { // add
                cols.forEach(function(c) {
                    p[c] += v[c];
                });
                return p;
            },
            function(p, v) { // remove
                cols.forEach(function(c) {
                    p[c] -= v[c];
                });
                return p;
            },
            function() { // init
                var p = {};
                cols.forEach(function(c) {
                    p[c] = 0;
                });
                return p;
            });
        return {
            all: function() {
                // or _.pairs, anything to turn the object into an array
                var retArray = d3.map(_groupAll.value()).entries();
                for(var i in retArray){
                    var tmp_key = retArray[i].key;
                    retArray[i].key=tmp_key.substring(removed_prefix.length, tmp_key.length);
                }
                return retArray;
            }
        };
    }
    // it doesn't really matter what you index the dimension on,
    // because you won't be able to filter on this dimension
    // we just need something to call .groupAll on.
    var dim = ndx.dimension(function(r) { return r; });
    var appGroup = regroup(dim, ['sum_app_park_man', 'sum_app_player', 'sum_app_radio', 'sum_app_navi', 'sum_app_vehicle',
    'sum_app_tel', 'sum_app_car_play'], 'sum_app_');
    var appRowChart = dc.rowChart('#resource-chart')
//            .width(350)
            .height(220)
            .dimension(dim)
            .group(appGroup)
            .elasticX(true);


    // Hard key usage
    var hardKeyGroup = regroup(dim, ['sum_hardkey_back','sum_hardkey_menu','sum_hardkey_mute','sum_hardkey_end','sum_hardkey_send',
                                 'sum_hardkey_volume_up','sum_hardkey_volume_down','sum_hardkey_media','sum_hardkey_on',
                                 'sum_hardkey_navi','sum_hardkey_radio','sum_hardkey_ptt','sum_hardkey_bga',
//                                 'sum_hardkey_car','sum_hardkey_phone','sum_hardkey_seat','sum_hardkey_favorite',
//                                 'sum_hardkey_skip_fw','sum_hardkey_skip_bw','sum_hardkey_play_pause','sum_hardkey_web'
                                 ],'sum_hardkey_');
    var hardKeyRowChart = dc.rowChart('#grade-chart')
//            .width(350)
            .height(220)
            .dimension(dim)
            .group(hardKeyGroup)
            .elasticX(true);

    // Mileage status
    var dim = ndx.dimension(function(r) { return r.mileStage; });
    var appGroup = dim.group(function(r) { return r*MILE_AGE_SCOPE+"-"+(r+1)*MILE_AGE_SCOPE + "  KM" });
    var appRowChart = dc.rowChart('#poverty-chart')
//            .width(350)
            .height(220)
            .dimension(dim)
            .group(appGroup)
            .elasticX(true);



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
//                        var pts = d3.select(".bubble-overlay");
//                        console.log(pts[0][0]);
//                        svg.append(pts[0][0]);
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
                    var firstChild = this.parentNode.firstChild;
                    if (firstChild) {
                        this.parentNode.insertBefore(this, firstChild);
                    }
                });
            };


    // Create overlay chart
    var chinaChart = dc.bubbleOverlay("#map-chart")
                .svg(d3.select("#map-chart svg"));
    var city2 = ndx.dimension(function(d) { return d.city; });
    var cityGroup2 = city2.group();
    chinaChart.width(960)
                              .height(350)
                              .dimension(city2)
                              .group(cityGroup2)
                              .radiusValueAccessor(function(p) {
                                  return p.value;
                              })
                              .r(d3.scale.linear().domain([0, 100000]))
                              .colors(["#ff7373","#ff4040","#ff0000","#bf3030","#a60000"])
                              .colorDomain([13, 30])
                              .colorAccessor(function(p) {
                                  return Math.floor(p.value);
                              })
                              .title(function(d) {
                                  return "City: " + d.key;
                              })
                              .point("北京", 560.5, 149)
                              .point("上海", 586.5, 234)
                              .point("广东", 542.5, 293)
                              .point("四川", 495.5, 263)
                              .debug(false);

    dc.renderAll();
};