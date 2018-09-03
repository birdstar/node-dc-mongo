var Subjects = require('./models/SubjectViews');
var dbConfig = require('.././config/db');

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes	
	// sample api route
    app.get('/api/data', function(req, res) {
        // use mongoose to get all nerds in the database
        var MongoClient = require('mongodb').MongoClient;
        var url=dbConfig.dbURL;
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mbsample");
            console.time('testTime');//testTime为计时器的名称
            dbo.collection("projects2"). find({}).toArray(function(err, result) { // 返回集合中所有数据
                if (err) throw err;
                res.json(result); // return all nerds in JSON format
        //    	console.timeEnd('testTime');
                db.close();
            });
        });
    });

    app.get('/api/navi', function(req, res) {
        // use mongoose to get all nerds in the database
        var MongoClient = require('mongodb').MongoClient;
        var url=dbConfig.dbURL;
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mbsample");
            console.time('testTime');//testTime为计时器的名称
            dbo.collection("navi"). find({}).toArray(function(err, result) { // 返回集合中所有数据
                if (err) throw err;
                res.json(result); // return all nerds in JSON format
        //    	console.timeEnd('testTime');
                db.close();
            });
        });
    });

    app.get('/api/profile', function(req, res) {
        // use mongoose to get all nerds in the database
        var MongoClient = require('mongodb').MongoClient;
        var url=dbConfig.dbURL;
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mbsample");
            dbo.collection("profiles"). find({}).toArray(function(err, result) { // 返回集合中所有数据
                if (err) throw err;
                res.json(result); // return all nerds in JSON format
                db.close();
            });
        });
        // frontend routes =========================================================
        app.get('*', function(req, res) {
            res.sendfile('./public/login.html');
        });
    });

    app.get('/api/sessions', function(req, res) {
            // use mongoose to get all nerds in the database
        var MongoClient = require('mongodb').MongoClient;
        var url=dbConfig.dbURL;
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mbsample");
            console.time('testTime');//testTime为计时器的名称
            dbo.collection("sessions"). find({}).toArray(function(err, result) { // 返回集合中所有数据
                if (err) throw err;
                console.timeEnd('testTime');
                res.json(result); // return all nerds in JSON format
                db.close();
            });
        });
        // frontend routes =========================================================
        app.get('*', function(req, res) {
            res.sendfile('./public/login.html');
        });
    });

    app.get('*', function(req, res) {
         res.sendfile('./public/login.html');
    });

    /* GET login page. */
    app.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
    	res.sendfile('./public/login.html');
    }).post(function(req,res){ 					   // 从此路径检测到post方式则进行post数据的处理操作
    	//get User info
    	 //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    	var User = global.dbHandel.getModel('user');
    	var uname = req.body.uname;				//获取post上来的 data数据中 uname的值
    	User.findOne({name:uname},function(err,doc){   //通过此model以用户名的条件 查询数据库中的匹配信息
    		if(err){ 										//错误就返回给原post处（login.html) 状态码为500的错误
    			res.send(500);
    			console.log(err);
    		}else if(!doc){ 								//查询不到用户名匹配信息，则用户名不存在
    			req.session.error = '用户名不存在';
    			res.send(404);							//	状态码返回404
    		//	res.redirect("/login");
    		}else{
    			if(req.body.upwd != doc.password){ 	//查询到匹配用户名的信息，但相应的password属性不匹配
    				req.session.error = "密码错误";
    				res.send(404);
    			//	res.redirect("/login");
    			}else{ 									//信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
    				req.session.user = doc;
    				res.send(200);
    			//	res.redirect("/home");
    			}
    		}
    	});
    });


}
