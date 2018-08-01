queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
console.log("start make graphs");
	
//Start Transformations
    var totalNum = 0
	var dataSet = apiData;
	var dateFormat = d3.time.format("%YYYY-%m-%dd");

	dataSet.forEach(function(d) {
	console.log(d.date);
//		d.date = dateFormat.parse(d.date);
//		d.date.setDate(1);
		totalNum = totalNum+1;
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
    dateChart
    		//.width(600)
    		.height(220)
    		.margins({top: 10, right: 50, bottom: 30, left: 50})
    		.dimension(ts)
    		.group(tsGroup)
    		.renderArea(true)
    		.transitionDuration(500)
    		.x(d3.time.scale().domain([minDate, maxDate]))
    		.elasticY(true)
    		.renderHorizontalGridLines(true)
        	.renderVerticalGridLines(true)
    		.xAxisLabel("Time")
    		.yAxis().ticks(5);

       //Avg speed
      var avg_dimension = ndx.dimension(function(d) { console.log("d.avg_speed:"+d.avg_speed); return d; });
      var avg_total = avg_dimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
   //var avg_total = avg_dimension.group().reduceCount(function(d) { return d.avg_speed });

      function reduceAdd(p, v) {
      console.log("reduceAdd:"+p.total);
        ++p.count;
        p.total += v.avg_speed;

        return p;
      }

      function reduceRemove(p, v) {
        console.log("reduceRemove:"+p.total);
        --p.count;
        p.total -= v.avg_speed;
        return p;
      }

      function reduceInitial() {
      console.log("reduceInitial");
        return {count: 0, total: 0};
      }

   //        var avgSpeed = dc.numberDisplay("#state-donations");
   //        avgSpeed
   //        		.valueAccessor(function(p) { console.log("test:"+p.value.total + " count:"+p.value.count); return p.value.count > 0 ? p.value.total / p.value.count : 0; })
   //        		.dimension(avg_dimension)
   //        		.group(avg_total);

   var avgSpeed = dc.gaugeChart("#state-donations");
       avgSpeed.height(220)
       		.margins({top: 10, right: 10, bottom: 30, left: 10})
//       		.valueAccessor(function(d) { console.log(d);return d.value; })
       		.valueAccessor(function(p) { console.log(p.value.count > 0 ? p.value.total / p.value.count : 0);return p.value.count > 0 ? p.value.total / p.value.count : 0; })
       		.dimension(avg_dimension)
            .group(avg_total);

//            var reducer = reductio().avg(function(d) { return d.avg_speed; })
//
//            // Now it should track count, sum, and avg.
//            avg_sum = ndx.groupAll();
//            reducer(avg_sum);
//
//            console.log("test:"+avg_sum);

//function orderValue(p) {
//  return p.total;
//}
//
//var topTotals = paymentVolumeByType.reduce(reduceAdd, reduceRemove, reduceInitial).order(orderValue).top(2);
//topTotals[0].key;   // payment type with highest total (e.g., "tab")
//topTotals[0].value; // reduced value for that type (e.g., {count:8, total:920})


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
//	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
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