/* 
 * program to test the i2c bus on the BB
 */

var mydev = require('./i2cbase');

/*
mydev.powerdown();
console.log(mydev.runSweep({start:110,increment:1000,steps:5}));
console.log(mydev.deviceParameters());

mydev.getGainFactor(10000,10000,1000);
mydev.getGainFactor(10000,10000,90000);

 var freqs = [];
 var gfs = [];
 
 for(var i=0; i<100; i++) {
     
    freq = i*40 + 1000;
     gf = mydev.getGainFactor(10000, 10000, freq);
     
     freqs.push(freq);
     gfs.push(gf);
 
 }
 
 for (var i=0; i<100; i++) {
     console.log(freqs[i] + "::" + gfs[i]);
 }

*/
var i2c = require('i2c');

var wire = new i2c(0x0D);

//wire.writeByte(0x82, function(e,r) {console.log(r);});
//wire.writeBytes(0xa0, [0x03, 0x10, 0x11, 0x12], function(e,r) {console.log(r);});
// weird hack of using a double command....
//wire.writeByte(0x82, function(e) {});
//wire.readBytes(0xa0, 03, function(e,r) {console.log(r);});
//wire.readBytes(0xa1, 10, function(e, r) {console.log(r);});
//wire.readBytes(0x82, [0x01, 0x02], function(e,r) {console.log(r);})

// obtain system phase

 res = mydev.runSweep({start:110, increment:199, steps:500});
 wire.readBytes(0x82, function(e,r) {console.log(r);})
 for (var i=0; i<res.SweepParameters.steps; i++) {
     console.log(res.Frequency[i] + "," + res.ImpedanceMod[i] + "," + res.ImpedanceArg[i]);
 }

