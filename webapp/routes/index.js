/* 
 * Functions serving http requests
 */
 
var i2cbase = require('../controller/i2cbase');
var fs = require('fs');
var datapath = '/home/debian/ImpedanceData/';
var cal_path = '/home/debian/NetworkAnalyzer/webapp/controller'


/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', {});
};


/* 
 * GET for refresh. Uses an AJAX call.
 */

exports.refresh = function(req, res) {
	var params = i2cbase.deviceParameters()
  console.log(params);
  res.send(params);
  };
  

/* 
 * POST request for running a sweep
 */

exports.sweep = function(req, res) {

  console.log(JSON.stringify(req.body));
  var sweepStats = i2cbase.runSweep(req.body, false);
  console.log(sweepStats);
  res.json(sweepStats);
  };


/*
 *  POST request for running a calibration
 */
 exports.calibrate = function(req, res) {
    var file = fs.createWriteStream('/home/debian/NetworkAnalyzer/webapp/controller/SmoothCal2.txt');

	var myparams = {range:"L",start:"20",increment:"10",steps:"58"};

	var result = i2cbase.getGainFactor(myparams, true);

	for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(req.body*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");
		}

	myparams = { range: 'M', start: '620', increment: '50', steps: '107' };
	result = i2cbase.getGainFactor(myparams, true);

	for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(req.body*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");	
		}

	myparams = {range:"H",start:"6000",increment:"500",steps:"187"}
	result = i2cbase.getGainFactor(myparams, true);

	for(var j=0; j<myparams.steps; j++) {
		file.write(result.Frequency[j] + "," + 
				1/(req.body*result.ImpedanceMod[j]) +","+ 
				result.ImpedanceArg[j] + "\n");
		}

	myparams = {range:"VH",start:"100000",increment:"1000",steps:"201"}
	result = i2cbase.getGainFactor(myparams, true);

	for(var j=0; j<myparams.steps; j++) {
		file.write(result.Frequency[j] + "," + 
				1/(req.body*result.ImpedanceMod[j]) +","+ 
				result.ImpedanceArg[j] + "\n");
		}

	file.end();
	res.end('Done!');
};


/* 
 * POST request for saving a file
 */
 
exports.save = function(req, res) {
	console.log(JSON.stringify(req.body));
	var filename = datapath + req.body.Name.toString() + '.json';
	console.log(filename);
	var resp = {"save" : false};
	fs.exists(filename, function(exists) {
		if(exists) {
			resp["error"] = "file exists.. choose another filename";
		}
		else {
			fs.writeFile(filename, 
				JSON.stringify(req.body), "utf8", 
				function() {
					resp["save"] = true;
				});
		}	
	res.json(resp);
	});
}
