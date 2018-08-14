
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
