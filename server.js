// modules =================================================
var express        = require('express');
var session       = require('express-session');
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');
var app            = express();

// configuration ===========================================
	
// config files
var port = process.env.PORT || 8777; // set our port
var db = require('./config/db');

// connect to our mongoDB database (commented out after you enter in your own credentials)
connectionsubject = mongoose.createConnection(db.urlSubjectViews);

//Login page
//app.use(function (req, res, next) {
//    var url = req.originalUrl;
//    console.log(req.session);
//    if (url != "/login" && !req.session.user) {
//        return res.redirect("/login");
//    }
//    next();
//});



// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(compression());
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(session({
  secret: 'express is powerful'
}));

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);	
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
