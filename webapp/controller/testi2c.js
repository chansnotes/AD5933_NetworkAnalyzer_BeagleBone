/* 
 * program to test the i2c bus on the BB
 */



// Device address
var DEVICE_ADDRESS = 0x0D; // default address of the AD5933

// Register map
var R_CONTROL0 =        0x80;
var R_CONTROL1 =        0x81;
var R_STARTF0 =         0x82;
var R_STARTF1 =         0x83;
var R_STARTF2 =         0x84;
var R_INCF0 =           0x85;
var R_INCF1 =           0x86;
var R_INCF2 =           0x87;
var R_NUMINC0 =         0x88;
var R_NUMINC1 =         0x89;
var R_SETTLE0 =         0x8A;
var R_SETTLE1 =         0x8B;
var R_STATUS =          0x8F;
var R_TEMP0 =           0x92;
var R_TEMP1 =           0x93;
var R_REAL0 =           0x94;
var R_REAL1 =           0x95;
var R_IMAG0 =           0x96;
var R_IMAG1 =           0x97;

// Command codes
var BLOCK_WRITE_CMD =       0xA0;
var BLOCK_READ_CMD =        0xA1;
var ADDRESS_POINTER_CMD =   0xB0
// Control Register 
// See Table 9
var INIT_WITH_START_FREQ =  0x10; 
var START_FREQ_SWEEP =      0x20;
var INCREMENT_FREQ =        0x30;
var REPEAT_FREQ =           0x40;
var MEASURE_TEMP =          0x90;
var POWER_DOWN_MODE =       0xA0; //default upon powerup
var STANDBY_MODE =          0xB0;

var OUTPUT_2VPP =           0x0; // default
var OUTPUT_200MVPP =        0x2;
var OUTPUT_400MVPP =        0x4;
var OUTPUT_1VPP =           0x6; 

var PGA_GAIN1X =            0x1;
var PGA_GAIN5X =            0x0; // default
var INTERNAL_CLK =          0x0; // default
var EXTERNAL_CLK =          0x8;

var RESET =                 0x10;

// Status register values
var VALID_TEMP =            0x1;
var VALID_DFT_DATA =        0x2;
var SWEEP_COMPLETE =        0x4;

// Global variables
var output_range = OUTPUT_200MVPP;
var pga_gain = PGA_GAIN1X;
var clock_source = INTERNAL_CLK;
var test_frequency;
var frequency_increment;
var clock_rate = 16.78E6; // default on startup
//var mydev = require('./i2cbase');

//mydev.powerdown();
//console.log(mydev.runSweep({start:110,increment:1000,steps:5}));
//console.log(mydev.deviceParameters());

//mydev.getGainFactor(10000,10000,1000);
//mydev.getGainFactor(10000,10000,90000);

// var freqs = [];
// var gfs = [];
// 
// for(var i=0; i<100; i++) {
//     
//     freq = i*40 + 1000;
//     gf = mydev.getGainFactor(10000, 10000, freq);
//     
//     freqs.push(freq);
//     gfs.push(gf);
// 
// }
// 
// for (var i=0; i<100; i++) {
//     console.log(freqs[i] + "::" + gfs[i]);
// }

var i2c = require('i2c');
var bs = require('bonescript'); 
var fs = require('fs');

//var zcal = 264.5;
var zcal = 100.2; 
var file = fs.createWriteStream('./SmoothCal1.txt');

function set_device_pwm(freq) {
  //console.log("Setting freq: " + freq); 
  bs.analogWrite('P8_13', 0, 2000, function(x) {
    if(x.err) {
      console.log(x.err); 
    }
  });

  duty = 0.5; 
  period = Math.round(1E9 / freq); 
  if(freq != 0) {
    bs.analogWrite('P8_13', duty, freq, function(x) {
    if(x.err) {
      console.log(x.err); 
      }
    });
  }
}

var wire = new i2c(DEVICE_ADDRESS, {device: '/dev/i2c-1'}); 
// associates with first i2c bus by default

var gf = require('./gainfactor');
var fs = require('fs');

// Helper functions

function upper_byte(integer) {
	return ((integer >> 8) & 0xFF);
}

function lower_byte(integer) {
	return (integer & 0xFF);
}

function error_msg(err) {
	if (err != null) {
		console.log("Error:: " + String(err));
	}
}

function point_to_address(address) {
	console.log("Pointing to address: " + address);
	wire.writeByte(address, function(err) {"Error in pointer: " + err});
}

function write_data_bytes(register, data) {
    // we use the block write command and use the length of the data array as
    // the first byte in sequence. 
    // the data is only a single number we use a simpler writebyte command. 
    point_to_address(register); 
    if(data.length == 1) {
        wire.writeBytes(register, data, error_msg); 
    }
    else {
        var senddata = [data.length].concat(data); 
        wire.writeBytes(BLOCK_WRITE_CMD, senddata, error_msg);  
    }
}


function set_device_standby() {
	// Only R_CONTROL0 will be overwritten. 
	console.log("Standby");
	var control_byte = STANDBY_MODE | output_range | pga_gain;
	write_data_bytes(R_CONTROL0, [control_byte]); 
}

function clock_is_internal() {
  point_to_address(R_CONTROL1);
  wire.readByte(function(err, res) {
    if(err == null) {
      return (res);
      // will return true if external clock
    }
    else {
      console.log("err" + err);
      return (undefined); 
    }
  });
}

function set_clock_source(src) {
  console.log("Setting clock source:" + src);
	var control_byte = src;
	write_data_bytes(R_CONTROL1, [control_byte]); 
}
	
function reset_device() {
	console.log("Reboot");
	var control_byte = RESET;
	write_data_bytes(R_CONTROL1, [control_byte]); 
}

function program_init() {
	var control_byte = INIT_WITH_START_FREQ | output_range | pga_gain;
	write_data_bytes(R_CONTROL0, [control_byte]);
	console.log("Program init: " + control_byte);
}

function start_sweep() {
    var control_byte = START_FREQ_SWEEP | output_range | pga_gain;
	write_data_bytes(R_CONTROL0, [control_byte]);
	console.log("Start sweep: " + control_byte);
}

function increment_frequency_step() {
	console.log("Increment sweep");
	var control_byte = INCREMENT_FREQ | output_range | pga_gain;
	write_data_bytes(R_CONTROL0, [control_byte]);
	console.log(control_byte);
	test_frequency += frequency_increment;
}

function repeat_frequency() {
	console.log("Repeat frequency");
	var control_byte = REPEAT_FREQ | output_range | pga_gain;
	write_data_bytes(R_CONTROL0, [control_byte]); 
}

function power_down_device() {
    console.log("Power Down");
	var control_byte = POWER_DOWN_MODE;
	write_data_bytes(R_CONTROL0, [control_byte]);
}

function read_status() {
    // obtains status register value and parses it neatly
    var status = {};
	point_to_address(R_STATUS);
	wire.readByte(function(err, res) {
		if(err == null) { 
			console.log("My result: " + res);
			status["Valid_Temp"] = (res & VALID_TEMP) == VALID_TEMP;
    		status["Valid_Data"] = (res & VALID_DFT_DATA) == VALID_DFT_DATA; 
    		status["Sweep_Complete"] = (res & SWEEP_COMPLETE) == SWEEP_COMPLETE; 
		}
		else {
			error_msg(err);
		}
	});
	return (status);
}

//set_device_standby();

// Mathematical functions 
function get_frequency_code(start, clock) {
	return (Math.round(start/(clock / 4) * Math.pow(2,27)));
}

function get_frequency(code, clock) {
	return (Math.round(code/Math.pow(2,27) * (clock/4)));
}

function twos_comp_to_dec(number) {
	// works on 16 bit numbers. 
	// check MSB 
	var value;
	if(number > 32767) {
		// number is negative
		value = ((~number & 0xffff) + 1)*(-1); // twos complement
	}
	else {
		value = number;
	}
	return (value);
}
function mod_cplx(complex, calib) {
    var magnitude = Math.sqrt(Math.pow(complex.real,2) + Math.pow(complex.imag,2));
    var impedance; 
    if(!calib) {
    	// if this is not a calibration run, calculate the actual impedance
    	var gainf = gf.get_GainFactor(test_frequency)[1];
    	impedance = 1/(gainf*magnitude);
    }
    else {
    	// return only the magnitude
    	impedance = magnitude;
    }
    
    return(impedance);
}

function arg_cplx(complex, calib) {
    var phase; 
    var arctan = Math.atan(complex.imag/complex.real);
    if(complex.real >= 0 && complex.imag >= 0) {
        // quadrant=1;
    }
    if(complex.real < 0 && complex.imag >= 0) {
        //quadrant=2;
        arctan += Math.PI;
    }
    if(complex.real < 0 && complex.imag < 0) {
        // quadrant = 3
        arctan += Math.PI;
    }
    if(complex.real > 0 && complex.imag < 0) {
        // quadrant = 4
        arctan += Math.PI*2;
    }
    arctan = arctan % (2*Math.PI); // do a modulo - 
    
    if(!calib) {
    	var sysphase = gf.get_GainFactor(test_frequency)[2];
    	arctan -= sysphase;
    }
       	
	return(arctan);
}

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

var control_byte = MEASURE_TEMP | output_range | pga_gain;
write_data_bytes(R_CONTROL0, [control_byte]);
var temperature;

sleep(10, function() {});
	if(read_status()["Valid_Temp"]) {
		point_to_address(R_TEMP0);
		wire.readBytes(BLOCK_READ_CMD, 2, function(err, res) {
			if(err == null) {
				var temp_code = twos_comp_to_dec((res[0] << 8) | res[1]);
				console.log("Temp code: " + temp_code);
				if((temp_code >>13) &1) {
					var temp = (temp_code - 16384)/32;
				}
				else {
					var temp = temp_code /32;
				}
			temperature = temp;
			}
				
			else {
				error_msg(err);
			}
		});
	}
	else { 
		// execute the same function with a small delay
		 setTimeout(measure_temperature, 100);
	}
	return(temperature);

function measure_temperature() {
	console.log("measuring temp");
	var temperature;
	var control_byte = MEASURE_TEMP | output_range | pga_gain;
	write_data_bytes(R_CONTROL0, [control_byte]);
	//i2cdump("temp"); 
	// This should set off temperature measurement
	sleep(10, function() {});
	if(read_status()["Valid_Temp"]) {
		point_to_address(R_TEMP0);
		wire.readBytes(BLOCK_READ_CMD, 2, function(err, res) {
			if(err == null) {
				var temp_code = (res[0] << 8) | res[1];
				console.log("Temp code: " + temp_code);
				if((temp_code >>13) &1) {
					var temp = (temp_code - 16384)/32;
				}
				else {
					var temp = temp_code /32;
				}
			temperature = temp;
			}
				
			else {
				error_msg(err);
			}
		});
	}
	else { 
		// execute the same function with a small delay
		 setTimeout(measure_temperature, 100);
	}
	return(temperature);
}

wire.writeByte(0x82, function(e) {});
wire.readBytes(0xa1, 10, function(e, r) {console.log(r);});

/******************************************
 *  Exported functions
 */
 
 
/* 
 * Function to extract all information from the device and return it as
 * a JSON object
 */

deviceParameters = function() {
	
	set_clock_source(INTERNAL_CLK);

	var parameters = {};
	parameters["DeviceAddress"] = DEVICE_ADDRESS;
	
	// read the 24 bytes starting from address 0x80
	point_to_address(R_CONTROL0);
	wire.readBytes(BLOCK_READ_CMD, 12, function(err, res) {
		if (err == null) {
			console.log(res);
			parameters["Control"] = (res[0] << 8) | res[1];
			parameters["Clock"] = res[1] >> 3 & 1;
			parameters["StartFrequency"] = get_frequency(
							(res[2] << 16) | (res[3] << 8) | res[4], clock_rate);
			parameters["Increment"] = get_frequency(
							(res[5] << 16) | (res[6] << 8) | res[7], clock_rate);
			parameters["NumIncrements"] = 
							((res[8]&1) << 8) | res[9];
			parameters["SettlingCyclesMult"] = (res[10]>>1)&3;
			parameters["SettlingCycles"] = (res[10]&1) | res[11];
			parameters["Status"] = read_status();
			parameters["PGA"] = res[0] & 1;
			parameters["ExcitationVolts"] = (res[0] >1) &3;
			parameters["Temperature"] = measure_temperature();

		}
		else {
			error_msg(err);
		}
	});
	
	set_clock_source(clock_source); 
	return(parameters);	
}

exports.deviceParameters = deviceParameters;


function programSweep(sweepParameters) {
	reset_device();
	var data = [];
	console.log("Clock: " + clock_rate);
	var start = get_frequency_code(parseInt(sweepParameters.start), clock_rate);
	var incr = get_frequency_code(parseInt(sweepParameters.increment), clock_rate); 
	
	console.log(sweepParameters);
	test_frequency = parseInt(sweepParameters.start);
	console.log(sweepParameters.increment);
	frequency_increment = parseInt(sweepParameters.increment);
	console.log(sweepParameters.steps);
	
	data[0] = (start >> 16) & 0xFF;
	data[1] = (start >> 8) & 0xFF;
	data[2] = start & 0xFF;
	data[3] = (incr >> 16) & 0xFF;
	data[4] = (incr >> 8) & 0xFF;
	data[5] = incr & 0xFF;
	data[6] = (parseInt(sweepParameters.steps) >> 8) & 0xFF;
	data[7] = parseInt(sweepParameters.steps) & 0xFF;
	data[8] = 0; 
	data[9] = 10; // 10 settling cycles - may change in a future version
	
	console.log("Prog: " + data);
	
	write_data_bytes(R_STARTF0, data); 
}



function poll_for_valid_data() {
	// waits for valid data and returns the valid status. 
	var valid = false;
	while(!valid) {
		var status = read_status();
		//console.log(status); 
		sleep(5, function() {});
		valid = status["Valid_Data"];
	}
	return (status);
}

function i2cdump(str) {
    point_to_address(R_CONTROL0); 
    wire.readBytes(BLOCK_READ_CMD, 25, function(err, dat) {
        console.log(str);
        console.log(dat);
        }); 
    }


function getAvgOfReplicates(num) {
  // function will issue the repeat_frequency command
  // until num readings are obtained. 
  var reps = []; 
  var ValidDate = false; 
  for(var count=0; count<num; count++) {
    //console.log("rep" + count); 
    status = poll_for_valid_data();
    
		if(status["Valid_Data"]) {
			point_to_address(R_REAL0);
			wire.readBytes(BLOCK_READ_CMD, 4, function(err,res) {
			  if(err==null) {
			    var complex = {};
					complex.real = twos_comp_to_dec((res[0]<<8)|res[1]);
					complex.imag = twos_comp_to_dec((res[2]<<8)|res[3]);
					reps[count] = complex;
					repeat_frequency(); 
			  }
			  else {
			    error_msg(err);
					repeat_frequency();
				}
			});
		}
	}
	
	var avg = {}; 
	avg.real = 0
	avg.imag = 0; 
	
	for(var i=0; i<reps.length; i++) {
	  avg.real += reps[i].real;
	  avg.imag += reps[i].imag;
	}
	
	avg.real = avg.real/reps.length;
	avg.imag = avg.imag/reps.length; 
	
	return(avg);
}

function runSweep(sweepParameters, calib) {
	// we pipe a calib parameter to the magnitude / phase calculation functions
	var baseline = fs.readFileSync("/home/debian/NetworkAnalyzerBone/webapp/controller/fertile_training.csv", "utf8");
	baseline = baseline.split("\n");
	console.log(baseline.length);
  baseline_dict = {};
  for(var i=1; i<baseline.length-1; i++) {
      record = baseline[i].split(','); 
      baseline_dict[record[0]] = {"zmean" : record[1], 
                                  "zsd" : record[2], 
                                  "phimean" : record[3], 
                                  "phisd" :record[4],
                                  }
      }
  console.log(baseline_dict); 
    
	var result = {}; 
	reset_device();
	//i2cdump("reset"); 
	
	if(sweepParameters.range == "H") {
	    set_device_pwm(0); 
	    set_clock_source(INTERNAL_CLK); 
	    clock_rate = 16.78E6; 
	    clock_source = INTERNAL_CLK;
	    }
	if(sweepParameters.range == "M") {
	    clock_rate = 1E6; 
	    set_device_pwm(clock_rate); 
	    clock_source = EXTERNAL_CLK;
	    set_clock_source(EXTERNAL_CLK); 
	}
	if(sweepParameters.range == "L") {
	    clock_rate = 100E3; 
	    set_device_pwm(clock_rate); 
	    clock_source = EXTERNAL_CLK;
	    set_clock_source(EXTERNAL_CLK); 
	}
	    
	result["SweepParameters"] = sweepParameters;
	result["TimeStarted"] = new Date().toString();
	result["ImpedanceMod"] = [];
	result["ImpedanceModAvg"] = []; 
	result["ImpedanceModSd"] = []; 
	result["ImpedanceArg"] = [];
	result["ImpedanceArgAvg"] = []; 
	result["ImpedanceArgSd"] = []; 
	result["Frequency"] = [];
	
	programSweep(sweepParameters);
	//i2cdump("sweep"); 

	
	//console.log("Var " + clock_source + "Internal?:" + clock_is_internal()); 
	//console.log(clock_rate); 
	
	console.log(deviceParameters());
	
	set_device_standby();
	//i2cdump("stdby"); 

	program_init();
	//i2cdump("init");
	
	sleep(30, start_sweep);
    //i2cdump("Start");
	var counter = 0;
	
	var SweepComplete = false;
	var ValidData = false;
	var status = read_status();
	
	
	while(!SweepComplete) {
		status = poll_for_valid_data();
		SweepComplete = status["Sweep_Complete"];
		console.log(status);	
		
		console.log("Step : " + counter); 
		
		complex = getAvgOfReplicates(3); 
		
		result["Frequency"].push(test_frequency);
		result["ImpedanceMod"].push(mod_cplx(complex, calib));
    if(baseline_dict[test_frequency.toString()] != undefined) {
      result["ImpedanceModAvg"].push(baseline_dict[test_frequency.toString()].zmean);
      result["ImpedanceModSd"].push(baseline_dict[test_frequency.toString()].zsd);
      result["ImpedanceArgAvg"].push(baseline_dict[test_frequency.toString()].phimean);
      result["ImpedanceArgSd"].push(baseline_dict[test_frequency.toString()].phisd);
      }
		result["ImpedanceArg"].push(arg_cplx(complex, calib));
					
		counter++;
		increment_frequency_step();
		
	}	
	result["Temperature"] = measure_temperature();
	power_down_device();		
	set_device_pwm(0); 	
	console.log("Done!");
	return(result);
}

exports.runSweep = runSweep;


exports.powerdown = power_down_device;
exports.reset = reset_device;
 
exports.getGainFactor = function(sweepparams) {
	console.log(sweepparams);
	var results = runSweep(sweepparams, calibrate=true);
	return(results);
}
