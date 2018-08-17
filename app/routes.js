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
//    console.log('start!')
    console.time('testTime');//testTime为计时器的名称
    dbo.collection("projects2"). find({}).toArray(function(err, result) { // 返回集合中所有数据
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

}
