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
	    console.log(d.date);
//		d.date = dateFormat.parse(d.date);
//		d.date.setDate(1);
		totalNum = totalNum+1;
		d.mileStage = Math.floor(d.sum_mileage/MILE_AGE_SCOPE);
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Select date from dropdown box
	var date = ndx.dimension(function(d) { return d.date; });
	var dateGroup = date.group();

    //Select date
	selectField = dc.selectMenu('#menuselect')
            .dimension(date)
            .group(dateGroup);

    //Select city
    var city = ndx.dimension(function(d) { return d.city; });
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
    		.margins({top: 10, right: 20, bottom: 30, left: 20})
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
       		.valueAccessor(function(p) { console.log(p.value.count +":"+ p.value.total);return p.value.count > 0 ? p.value.total / p.value.count : 0; })
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


//    var max_svc_dim = ndx.dimension(function(d) { return d; });
//    var max_svc_grp1 = avg_dimension.group().reduceSum(function(d) { return d.sum_app_park_man; });
//    var max_svc_grp2 = avg_dimension.group().reduceSum(function(d) { return d.sum_app_player; });
//
//    var max_svc_grp = avg_dimension.group().reduce(reduceAddSvc, reduceRemoveSvc, reduceInitialSvc);
//
//    function reduceAddSvc(p, v) {
//            ++p.count;
//            p.sum_app_park_man += v.sum_app_park_man;
//            p.sum_app_player += v.sum_app_player;
//
//            return p;
//          }
//
//    function reduceRemoveSvc(p, v) {
//            --p.count;
//            p.sum_app_park_man -= v.sum_app_park_man;
//            p.sum_app_player -= v.sum_app_player;
//            return p;
//          }
//
//          function reduceInitialSvc() {
//            return {count: 0, sum_app_park_man: 0, sum_app_player:0};
//          }
//////////////////////////////////////////////////////
//    var max_svc_chart = dc.rowChart("#resource-chart");
//	max_svc_chart
//		//.width(300)
//		.height(220)
//        .dimension(max_svc_dim)
//        .group(max_svc_2)
//        .xAxis("test").ticks(4);
//    var compositeChart = dc.compositeChart("#resource-chart");

//var actuals = dc.barChart("#resource-chart");
//    var actuals = dc.barChart("compositeChart");
//                    .gap(65)
//                    .dimension(max_svc_dim)
//                    .group(max_svc_grp1);
//                    .valueAccessor(function (d) {
//                    console.log(d);
//                        return d.value.sum_app_park_man;
//                    });

//     actuals
//		.width(300)
//		.height(220)
//        .dimension(max_svc_dim)
//        .group(max_svc_grp)
//        .x(d3.scale.ordinal().domain(['sum_app_park_man', 'abc']))
//        .xUnits(dc.units.ordinal)
//        .brushOn(true)
//        .xAxis().ticks(4);


//        var budgets = dc.rowChart(compositeChart);
//        actuals
//        		.width(300)
//        		.height(220)
//                .dimension(max_svc_dim)
//                .group(max_svc_grp2)
//                .xAxis().ticks(4);

//            var budgets = dc.barChart(compositeChart)
//                    .dimension(max_svc_dim)
//                    .group(max_svc_grp2)
//                    .x(d3.scale.ordinal().domain(['sum_app_player']))
//                    .xUnits(dc.units.ordinal)
//                    .brushOn(false)
//                    .xAxis().ticks(4);

//            compositeChart
//                    .width(300)
//                    .height(200)
//                    .dimension(max_svc_dim)
//                    .group(max_svc_grp)
////                    .elasticY(true)
//                    .x(d3.time.scale().domain(timeExtent))
//                    .xUnits(d3.time.months)
////                    .round(d3.time.month.round)
////                    .renderHorizontalGridLines(true)
//                    .compose([budgets, actuals])
//                    .brushOn(true);
//compositeChart
//        .width(300)
//        .height(220)
//        .x(d3.scale.linear().domain([0,100]))
//        .yAxisLabel("")
//        .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
//        .renderHorizontalGridLines(true)
//        .compose(
//           dc.lineChart(compositeChart)
//                    .dimension(max_svc_dim)
//                    .colors('red')
//                    .group(max_svc_grp1)
//                    .dashStyle([2,2]),
//                 dc.lineChart(compositeChart)
//                    .dimension(max_svc_dim)
//                    .colors('blue')
//                    .group(max_svc_grp2)
//                    .dashStyle([5,5])
//            )
//        .brushOn(false)
////        .render();




//compositeChart
//   .width(300)
//   .height(220)
//   .x(d3.scale.ordinal().domain(['sum_app_park_man','aaa']))
//   .yAxisLabel("Count")
//   .xAxisLabel("Age")
//   .renderHorizontalGridLines(true)
//   .compose ([actuals
////      dc.lineChart(compositeChart)
////         .dimension(max_svc_dim)
////         .colors('red')
////         .group(max_svc_grp1, "Male")
////         .dashStyle([2,2]),
////      dc.lineChart(compositeChart)
////         .dimension(max_svc_dim)
////         .colors('blue')
////         .group(max_svc_grp2, "Female")
////         .dashStyle([5,5])
//   ])
//.brushOn(true)
//.render();
//////////////////////////////////////////////////////



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






//	//Define Dimensions
//	    var datePosted = ndx.dimension(function(d) { return d.date_posted; });
//	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
//	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
//	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
//	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
//	var state = ndx.dimension(function(d) { return d.school_state; });
//	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });
//
//
//	//Calculate metrics
//	var projectsByDate = datePosted.group();
//	var projectsByGrade = gradeLevel.group();
//	var projectsByResourceType = resourceType.group();
//	var projectsByFundingStatus = fundingStatus.group();
//	var projectsByPovertyLevel = povertyLevel.group();
//	var stateGroup = state.group();
//
//	var all = ndx.groupAll();
//
//	//Calculate Groups
//	var totalDonationsState = state.group().reduceSum(function(d) {
//		return d.total_donations;
//	});
//
//	var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
//		return d.grade_level;
//	});
//
//	var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
//		return d.funding_status;
//	});
//
//
//
//	var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});
//
//	//Define threshold values for data
//	var minDate = datePosted.bottom(1)[0].date_posted;
//	var maxDate = datePosted.top(1)[0].date_posted;
//
//console.log(minDate);
//console.log(maxDate);
//
//    //Charts
//	var dateChart = dc.lineChart("#date-chart");
//	var gradeLevelChart = dc.rowChart("#grade-chart");
//	var resourceTypeChart = dc.rowChart("#resource-chart");
//	var fundingStatusChart = dc.pieChart("#funding-chart");
//	var povertyLevelChart = dc.rowChart("#poverty-chart");
//	var totalProjects = dc.numberDisplay("#total-projects");
//	var netDonations = dc.numberDisplay("#net-donations");
//	var stateDonations = dc.barChart("#state-donations");
//
//
//  selectField = dc.selectMenu('#menuselect')
//        .dimension(state)
//        .group(stateGroup);
//
//       dc.dataCount("#row-selection")
//        .dimension(ndx)
//        .group(all);
//
//
//	totalProjects
//		.formatNumber(d3.format("d"))
//		.valueAccessor(function(d){return d; })
//		.group(all);
//
//	netDonations
//		.formatNumber(d3.format("d"))
//		.valueAccessor(function(d){return d; })
//		.group(netTotalDonations)
//		.formatNumber(d3.format(".3s"));
//
//	dateChart
//		//.width(600)
//		.height(220)
//		.margins({top: 10, right: 50, bottom: 30, left: 50})
//		.dimension(datePosted)
//		.group(projectsByDate)
//		.renderArea(true)
//		.transitionDuration(500)
//		.x(d3.time.scale().domain([minDate, maxDate]))
//		.elasticY(true)
//		.renderHorizontalGridLines(true)
//    	.renderVerticalGridLines(true)
//		.xAxisLabel("Year")
//		.yAxis().ticks(6);
//
//	resourceTypeChart
//        //.width(300)
//        .height(220)
//        .dimension(resourceType)
//        .group(projectsByResourceType)
//        .elasticX(true)
//        .xAxis().ticks(5);
//
//	povertyLevelChart
//		//.width(300)
//		.height(220)
//        .dimension(povertyLevel)
//        .group(projectsByPovertyLevel)
//        .xAxis().ticks(4);
//
//	gradeLevelChart
//		//.width(300)
//		.height(220)
//        .dimension(gradeLevel)
//        .group(projectsByGrade)
//        .xAxis().ticks(4);
//
//
//          fundingStatusChart
//            .height(220)
//            //.width(350)
//            .radius(90)
//            .innerRadius(40)
//            .transitionDuration(1000)
//            .dimension(fundingStatus)
//            .group(projectsByFundingStatus);
//
//
//    stateDonations
//    	//.width(800)
//        .height(220)
//        .transitionDuration(1000)
//        .dimension(state)
//        .group(totalDonationsState)
//        .margins({top: 10, right: 50, bottom: 30, left: 50})
//        .centerBar(false)
//        .gap(5)
//        .elasticY(true)
//        .x(d3.scale.ordinal().domain(state))
//        .xUnits(dc.units.ordinal)
//        .renderHorizontalGridLines(true)
//        .renderVerticalGridLines(true)
//        .ordering(function(d){return d.value;})
//        .yAxis().tickFormat(d3.format("s"));
//




//       dc.dataCount("#row-selection")
//        .dimension(ndx)
//        .group(all);

    dc.renderAll();

};