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
    dbo.collection("projects"). find({}).toArray(function(err, result) { // 返回集合中所有数据
    	if (err) throw err;
    	res.json(result); // return all nerds in JSON format
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
}
