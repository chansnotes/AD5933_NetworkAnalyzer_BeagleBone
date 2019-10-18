
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var i2cbase = require('./controller/i2cbase.js');
//console.log(i2cbase);

var app = express();

// all environments
app.set('port', process.env.PORT || 3030);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.directory(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// GET calls - no changes to data on server
app.get('/', routes.index);
app.get('/refresh', routes.refresh);

// POST calls - may change data / parameters on server
app.post('/sweep/', routes.sweep);

app.post('/save/', routes.save);
app.post('/calibrate/', routes.calibrate);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Impedance Analyzer server listening on port ' + app.get('port'));
});