var fs = require('fs');
var lib = require('./');

var input = lib.createReadStream();

console.log("here");

//var writable = fs.createWriteStream('file.txt');
//input.pipe(writable, { end: false });
input.pipe(process.stdout, {end: false});

input.on('end', function() {
  console.log("end");
  writable.end('Goodbye\n');
});

setInterval(function() {
  console.log("timeout");
}, 1000);

console.log("down here");
