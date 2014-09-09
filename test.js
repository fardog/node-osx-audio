var fs = require('fs');
var lib = require('./');

var input = new lib.Input();

var writable = fs.createWriteStream('file.txt');
input.pipe(writable, { end: false });

console.log('outside');

input.on('end', function() {
  console.log("end");
  writable.end('Goodbye\n');
});

console.log('very outside');
