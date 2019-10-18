/* Gain factors for 10k feedback resistor, calibrated with a 
 * 10k 1% resistor
 */

var filename = "/home/debian/NetworkAnalyzer/webapp/controller/SmoothCal2.txt";

//console.log(__dirname);
var fs = require('fs');
var textarray = fs.readFileSync(filename).toString().split("\n");

var freqs = [];
var gfs = [];
var sysp = []

for(i in textarray) {
    var line = textarray[i].split(",");
    freqs.push(parseFloat(line[0]));
    gfs.push(parseFloat(line[1]));
    sysp.push(parseFloat(line[2]));
}
    
var get_GainFactor = function(frequency) {
    //console.log(freqs);
    //console.log(gfs);
    var i = 0;
    while(freqs[i] < frequency) {
        i++;
        //console.log(i);
    }
    //console.log('In ' + frequency + ' out ' + freqs[i]); 
    return([freqs[i], gfs[i], sysp[i]]);
}

exports.get_GainFactor = get_GainFactor;


exports.test_gain_factor = function() {
    for(var i=0; i<10; i++) {
        console.log("testing " + i*100 +":"+ get_GainFactor(i*100));
    }
}
