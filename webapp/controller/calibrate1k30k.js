var i2c = require('./i2cbase');

var fs = require('fs');

//var zcal = 264.5;
var zcal = 100.2; 

var file = fs.createWriteStream('./SmoothCal2.txt');


var myparams = {range:"L",start:"20",increment:"10",steps:"58"};

var result = i2c.getGainFactor(myparams, true);

for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(zcal*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");
	}
/*
myparams = { range: 'LM', start: '200', increment: '50', steps: '8' };
result = i2c.getGainFactor(myparams, true);

for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(zcal*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");
	}
*/
myparams = { range: 'M', start: '620', increment: '50', steps: '107' };
result = i2c.getGainFactor(myparams, true);

for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(zcal*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");	
	}

myparams = {range:"H",start:"6000",increment:"500",steps:"187"}
result = i2c.getGainFactor(myparams, true);

for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(zcal*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");
	}

myparams = {range:"VH",start:"100000",increment:"1000",steps:"201"}
result = i2c.getGainFactor(myparams, true);

for(var j=0; j<myparams.steps; j++) {
	file.write(result.Frequency[j] + "," + 
			1/(zcal*result.ImpedanceMod[j]) +","+ 
			result.ImpedanceArg[j] + "\n");
	}


file.end();