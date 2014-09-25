var audio = require('./audio');
var inherits = require('util').inherits;
var Readable = require('stream').Readable;
var debug = require('debug')('osxaudio:input');

var MAX_BUFFERS = 16;

var input = null;

function Input(opts) {
  if (!(this instanceof Input)) {
    return new Input(opts);
  }
  Readable.call(this, opts);

  var self = this;
  if (!opts) opts = {};

  self._audioBuffers = [];

  if (!input) {
    input = new audio.input();
  }

  input.on('message', function(size, message) {
    if (self._audioBuffers.push(message) > MAX_BUFFERS) {
      debug('exceeded MAX_BUFFERS, shifting older buffers');
      self._audioBuffers.splice(0, self._audioBuffers.length - MAX_BUFFERS);
    }
    self.read(0);
  });

  if (!input.isOpen()) {
    debug('opening input');
    input.openInput();
  }

  debug("instantiated.");

  return self;
}
inherits(Input, Readable);

Input.prototype._read = function(n) {
  debug("_read()");
  var chunk = this._audioBuffers.pop();
  if (typeof chunk !== 'undefined') {
    debug("_read() pushing data");
    this.push(chunk);
  }
  else {
    debug("_read() pushing blank string");
    this.push('');
  }
};

Input.prototype.openInput = function() {
  if(!input) {
    input = new audio.input();
  }

  if (!input.isOpen()) {
    input.openInput();
  }
};

Input.prototype.closeInput = function() {
  if (input.isOpen()) {
    debug("closeInput() input was open, shutting down");
    input.closeInput();
    
    // push null to shut down the stream
    this.push(null);
  }
};

module.exports = Input;
