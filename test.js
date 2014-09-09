var fs = require('fs');
var lib = require('./');

var input = new lib.Input({objectMode: true});

var writable = fs.createWriteStream('file.txt');
input.pipe(writable, { end: false });
//input.pipe(process.stdout, {end: false});

input.on('end', function() {
  console.log("end");
  writable.end('Goodbye\n');
});

setInterval(function() {
  console.log("timeout");
}, 1000);
