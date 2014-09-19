var audio = require('bindings')('audio');
var Stream = require('stream');
var debug = require('debug')('osxaudio:input');

// Audio input inherits from EventEmitter
var EventEmitter = require('events').EventEmitter;
audio.input.prototype.__proto__ = EventEmitter.prototype;

module.exports = audio;

audio.createReadStream = function(input) {
  debug('creating new read stream');
  input = input || new audio.input();
  var stream = new Stream();
  stream.readable = true;
  stream.paused = false;
  stream.queue = [];

  input.on('message', function(size, message) {
    debug('got message from input');
    debug(size);
    debug(message);
    
    if (!stream.paused) {
      stream.emit('data', message);
    } else {
      stream.queue.push(message);
    }
  });

  stream.pause = function() {
    stream.paused = true;
  };

  stream.resume = function() {
    stream.paused = false;
    while (stream.queue.length && stream.queue.shift()) {}
  };

  input.openInput();

  return stream;
};

