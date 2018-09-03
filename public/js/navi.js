queue()
    .defer(d3.json, "/api/navi")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
console.log("start make graphs for navigation");

//Start Transformations
	var dataSet = apiData;
	var session_count=1;
	var dateFormat = d3.time.format("%YYYY-%m-%dd");
	var MILE_AGE_SCOPE=30
	var TIME_AGE_SCOPE=30
//    var max_tx=0
	dataSet.forEach(function(d) {
		d.mileStage = Math.floor(d.sum_mileage/MILE_AGE_SCOPE);
		d.timeStage = Math.floor(d.driven_time/TIME_AGE_SCOPE);
//		if (d.timeStage>max_tx) max_tx=d.timeStage;
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

        //Sessions count
        var scm = ndx.dimension(function(d) { return d.session_id; });
        var scGroup = scm.groupAll().reduce(
                function (p, d) {
                                if( d.session_id in p.sessions)
                                    p.sessions[d.session_id]++;
                                else p.sessions[d.session_id] = 1;
                                return p;
                            },

                            function (p, d) {
                                p.sessions[d.session_id]--;
                                if(p.sessions[d.session_id] === 0)
                                    delete p.sessions[d.session_id];
                                return p;
                            },

                            function () {
                                return {sessions: {}};
                            }
                )
        var totalProjects = dc.numberDisplay("#total-sessions");
        totalProjects
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d){return Object.keys(d.sessions).length; })
                .group(scGroup);

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

    function addNavi(p, d) {
            p = p + d.sum_app_navi;
            return p;
    }

    function removeNavi(p, d) {
        p = p - d.sum_app_navi;
        return p;
    }

    function initNavi() {
        return 0;
    }

    function addNaviRatio(p, d) {
        if (d.navi_used == "YES") {
            ++p.used;
        } else {
            ++p.unUsed;
        }
//        console.log(p.used/(p.used + p.unUsed));
//        return (p.used/(p.used + p.unUsed));
        if ((p.used + p.unUsed) <= 0) {
            console.log("less than 0");
//            return 0;
        }
//        var t=p.used/(p.used + p.unUsed);
//        console.log(t)
        return p;
    }

    function removeNaviRatio(p, d) {
        if (d.navi_used == "YES") {
            --p.used;
        } else {
            --p.unUsed;
        }
//        if ((p.used + p.unUsed) <= 0) return 0;
        return p;
    }

    function initRatioNavi() {
        return {used: 0, unUsed: 0};
    }



    // Navigation usage by time
    var ts = ndx.dimension(function(d) { return d.end_timestamp; });
    var tsGroup = ts.group().reduce(addNavi, removeNavi, initNavi);
    var dateChart = dc.lineChart("#date-chart");
    var minDate = ts.bottom(1)[0].end_timestamp;
    console.log("min_Date:"+minDate)
    var maxDate = ts.top(1)[0].end_timestamp;
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
    		.yAxisLabel("Navi Usage Counts")
    		.yAxis().ticks(5);




    //Car type
    var ct = ndx.dimension(function(d) { return d.car_type; });
    var ctGroup = ct.group().reduce(addNavi, removeNavi, initNavi);
    var carTypeChart = dc.pieChart("#car-type-chart");
    carTypeChart
                .height(220)
                //.width(350)
                .radius(90)
                .innerRadius(40)
                .transitionDuration(1000)
                .dimension(ct)
                .group(ctGroup);
//
//
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

    var avgSpeed = dc.gaugeChart("#avg-speend-chart");
       avgSpeed.height(220)
       		.margins({top: 10, right: 10, bottom: 30, left: 10})
       		.valueAccessor(function(p) { return p.value.count > 0 ? p.value.total / p.value.count : 0; })
       		.dimension(avg_dimension)
            .group(avg_total);
//
//    //Session count;
//    var dim_session = ndx.dimension(function(r) { return r.session_id; });
//    var _groupSession = dim_session.group();
//    session_count=_groupSession.size();
//
//    //Service usage
//    function regroup(dim, cols, removed_prefix, ndx) {
//        var _groupAll = dim.groupAll().reduce(
//            function(p, v) { // add
//                cols.forEach(function(c) {
//                    if (c=='session_id'){
//                        p[c]++;
//                    }else{
//                        p[c] += v[c];
//                    }
//                });
//                return p;
//            },
//            function(p, v) { // remove
//                cols.forEach(function(c) {
//                    if (c=='session_id'){
//                        p[c]--;
//                     }else{
//                        p[c] -= v[c];}
//                    });
//                return p;
//            },
//            function() { // init
//                var p = {};
//                cols.forEach(function(c) {
//                    p[c] = 0;
//                });
//                return p;
//            });
//
//        return {
//            all: function() {
//                // or _.pairs, anything to turn the object into an array
//                var retArray = d3.map(_groupAll.value()).entries();
//                for(var i in retArray){
//                    var tmp_key = retArray[i].key;
//                    if (tmp_key=="session_id"){
//                        session_count=retArray[i].value;
//                        retArray.splice(i,1);
//                        continue;
//                    }
//                }
//                for(var i in retArray){
//                    var tmp_key = retArray[i].key;
//                    retArray[i].key=tmp_key.substring(removed_prefix.length, tmp_key.length);
//                    retArray[i].value = retArray[i].value/session_count;
//                }
//                return retArray;
//            }
//        };
//    }
//    // it doesn't really matter what you index the dimension on,
//    // because you won't be able to filter on this dimension
//    // we just need something to call .groupAll on.
//    var dim = ndx.dimension(function(r) { return r; });
//    var appGroup = regroup(dim, ['sum_app_park_man', 'sum_app_player', 'sum_app_radio', 'sum_app_navi', 'sum_app_vehicle',
//    'sum_app_tel', 'sum_app_car_play','session_id',], 'sum_app_', ndx);
//    var appRowChart = dc.rowChart('#incar-service-chart')
////            .width(350)
//            .height(220)
//            .dimension(dim)
//            .group(appGroup)
//            .elasticX(true);
//
//
//    // Hard key usage
//    var hardKeyGroup = regroup(dim, ['sum_hardkey_back','sum_hardkey_menu','sum_hardkey_mute','sum_hardkey_end','sum_hardkey_send',
//                                 'sum_hardkey_volume_up','sum_hardkey_volume_down','sum_hardkey_media','sum_hardkey_on',
//                                 'sum_hardkey_navi','sum_hardkey_radio','sum_hardkey_ptt','sum_hardkey_bga',
////                                 'sum_hardkey_car','sum_hardkey_phone','sum_hardkey_seat','sum_hardkey_favorite',
////                                 'sum_hardkey_skip_fw','sum_hardkey_skip_bw','sum_hardkey_play_pause','sum_hardkey_web'
//                                 ,'session_id'],'sum_hardkey_', ndx);
//    var hardKeyRowChart = dc.rowChart('#hardkey-chart')
////            .width(350)
//            .height(220)
//            .dimension(dim)
//            .group(hardKeyGroup)
//            .elasticX(true);
//

    // Driven distance status chart
    var dim = ndx.dimension(function(r) { return r.mileage_range; });
//    var appGroup = dim.group(function(r) { return r+"-"+(r+1)*MILE_AGE_SCOPE + "  KM" });
    var appGroup = dim.group().reduce(addNavi, removeNavi, initNavi);
    var appRowChart = dc.rowChart('#driven-distance-chart')
//            .width(350)
            .height(220)
            .cap(10)
            .dimension(dim)
            .group(appGroup)
            .elasticX(true);

    // Driven time status chart
    var time_dim = ndx.dimension(function(r) {return r.time_range; });
//    var timeGroup = time_dim.group(function(r) {return (r+"-"+(r+1)*TIME_AGE_SCOPE + "  Minutes") });
    var timeGroup = time_dim.group().reduce(addNavi, removeNavi, initNavi);
    var appRowChart = dc.rowChart('#driven-time-chart')
//            .width(350)
            .height(220)
            .cap(10)
            .othersGrouper(false)
            .dimension(time_dim)
            .group(timeGroup)
            .elasticX(true);

    // Navigation usage by area
    function getTops(source_group) {
            return {
                all: function () {
                    return source_group.top(10);
                }
            };
    }
    var navi_city_dim = ndx.dimension(function(r) {return r.city; });
    var navi_city_group = navi_city_dim.group().reduce(addNavi, removeNavi, initNavi);
    var top_city_group = getTops(navi_city_group);
    var navi_city_chart = dc.barChart("#city-chart")
            .height(220)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .brushOn(false)
            .dimension(navi_city_dim)
            .barPadding(0.1)
            .outerPadding(0.05)
            .elasticX(true)
            .elasticY(true)
            .margins({top: 10, right: 50, bottom: 40, left: 50})
            .group(top_city_group);

    var dict_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    var navi_week_dim = ndx.dimension(function(r) {return dict_week[r.day_of_week]; });
    var navi_week_group = navi_week_dim.group().reduce(addNavi, removeNavi, initNavi);
    var top_week_group = getTops(navi_week_group);
    var navi_week_chart = dc.barChart("#week-chart")
            .height(220)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .brushOn(false)
            .dimension(navi_week_dim)
            .barPadding(0.1)
            .outerPadding(0.05)
            .elasticX(true)
            .elasticY(true)
            .margins({top: 10, right: 50, bottom: 40, left: 50})
            .group(navi_week_group);

    // Navigation ratio usage by area
    var navi_ratio_city_dim = ndx.dimension(function(r) {return r.city; });
    var navi_ratio_city_group = navi_city_dim.group().reduce(addNaviRatio, removeNaviRatio, initRatioNavi);
    var top_city_ratio_group = getTops(navi_ratio_city_group);
    var navi_city_ratio_chart = dc.barChart("#city-ratio-chart")
            .height(220)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .brushOn(false)
            .valueAccessor(function(p) { return p.value.used/(p.value.used + p.value.unUsed); })
            .dimension(navi_ratio_city_dim)
            .barPadding(0.1)
            .outerPadding(0.05)
            .elasticX(true)
            .elasticY(true)
            .margins({top: 10, right: 50, bottom: 40, left: 50})
            .ordering(function(p) { if (p.data.value.used==0) return 100; else return -p.data.value.used/(p.data.value.used + p.data.value.unUsed); })
//            .data(function (d) {
//                return d.order(function (d) {
//                    return -d.used/(d.used+d.unUsed);
//                }).top(10);
//            })
            .group(top_city_ratio_group);

    // Navigation Y/N comparation
    var navi_ratio_dim = ndx.dimension(function(d) { return d.navi_used; });
    var navi_ratio_group = navi_ratio_dim.group()
    var naviRatioChart = dc.pieChart("#navi-ratio-chart");
        naviRatioChart
                .height(220)
                //.width(350)
                .radius(90)
                .innerRadius(40)
                .transitionDuration(1000)
                .dimension(navi_ratio_dim)
                .group(navi_ratio_group);



//     // Hardkey sequence status
//
//
//
//     var hardkey_seq_dim = ndx.dimension(function(d) {return d.hard_key_seq.split('-').slice(0,10);})
//     var hardkey_seq_group = hardkey_seq_dim.group();
//     var hardkey_seq_group = remove_empty_bins(hardkey_seq_group) // or filter_bins, or whatever
//
//     function remove_empty_bins(source_group) {
//            return {
//                all:function () {
//                    return source_group.all().filter(function(d) {
//                        //return Math.abs(d.value) > 0.00001; // if using floating-point numbers
//                        var key = d.key;
//                        if (key.length!=1 || key[0]!="NULL") return true
//                        else return false;
//                    });
//                }
//            };
//     }
//
//
//    // d3.schemeCategory20b has been removed from D3v5
//    var d3SchemeCategory20b = [
//        '#393b79','#5254a3','#6b6ecf','#9c9ede','#637939',
//        '#8ca252','#b5cf6b','#cedb9c','#8c6d31','#bd9e39',
//        '#e7ba52','#e7cb94','#843c39','#ad494a','#d6616b',
//        '#e7969c','#7b4173','#a55194','#ce6dbd','#de9ed6'
//    ];
//     var hardkeySeqChart = dcv3.sunburstChart('#hardkey-seq-chart')
//     //            .width(350)
//                 .height(220)
//                 .dimension(hardkey_seq_dim)
//                 .group(hardkey_seq_group)
////                 .colors(d3v5.scaleOrdinal(d3SchemeCategory20b))
//                 .legend(dc.legend());
//
//    var hardkeySeqChartTopN = dcv3.sunburstChart('#hardkey-seqT-chart')
//         //            .width(350)
//                     .height(220)
//                     .dimension(hardkey_seq_dim)
//                     .cap(20)
//                     .othersGrouper(false)
//                     .group(hardkey_seq_group)
//    //                 .colors(d3v5.scaleOrdinal(d3SchemeCategory20b))
//                     .legend(dc.legend());

    dc.renderAll();
//    dcv3.renderAll();

//    var fileChart = dcv3.sunburstChart("#hardkey-seq-chart");
//    var fileChart = dcv3.sunburstChart("#hardkey-seq-chart");
////    var typeChart = dc.pieChart("#type_chart");
////    d3v5.tsv("cat.tsv").then(function (cats) {
////        var ndx = crossfilter(cats);
////        var picturesDimension = ndx.dimension(function (d) {console.log(d);
////            return d.file.split('/');
////        });
//        var picturesDimension = ndx.dimension(function(d) {return d.hard_key_seq.split('-').slice(0,10);})
////        picturesDimension.filter(function(d){console.log(d.length !== 1 );return d.length !== 1 ;})
//        var picturesGroup = picturesDimension.group();
//
//        var picturesGroup = remove_empty_bins(picturesGroup) // or filter_bins, or whatever
//
//        function remove_empty_bins(source_group) {
//            return {
//                all:function () {
//                    return source_group.all().filter(function(d) {
//                        //return Math.abs(d.value) > 0.00001; // if using floating-point numbers
//                        var key = d.key;
//                        if (key.length!=1 || key[0]!="NULL") return true
//                        else return false;
//                    });
//                }
//            };
//        }
//
//        // d3.schemeCategory20b has been removed from D3v5
//        var d3SchemeCategory20b = [
//            '#393b79','#5254a3','#6b6ecf','#9c9ede','#637939',
//            '#8ca252','#b5cf6b','#cedb9c','#8c6d31','#bd9e39',
//            '#e7ba52','#e7cb94','#843c39','#ad494a','#d6616b',
//            '#e7969c','#7b4173','#a55194','#ce6dbd','#de9ed6'
//        ];
//        fileChart
////            .width(700)
//            .height(320)
//            .dimension(picturesDimension)
//            .group(picturesGroup)
////            .colors(d3.scale.ordinal(d3SchemeCategory20b))
//            .legend(dcv3.legend());
//
//        dc.renderAll();
//        dcv3.renderAll();
//    });

};