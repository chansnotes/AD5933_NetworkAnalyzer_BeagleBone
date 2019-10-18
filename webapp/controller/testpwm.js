var b = require('bonescript');
b.analogWrite('P8_13', 0.5, 100000, function(x) {console.log(x);});
