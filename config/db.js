
var mongoPath = process.env['MONGO_NAME'];
var host='localhost';

if (mongoPath !== null && mongoPath !== undefined && mongoPath !== '') {
    console.log(mongoPath);
    host = mongoPath;
}
console.log("host:"+host);
var dbURL='mongodb://'+host+':27017/mbsample';

module.exports = {
    dbURL: dbURL,
    urlSubjectViews:dbURL,
}
