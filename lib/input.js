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

  if (!opts) opts = {};

  this._audioBuffers = [];

  if (!input) {
    input = new audio.input();
  }

  input.on('message', this._audioCallback.bind(this));

  if (!input.isOpen()) {
    debug('opening input');
    input.openInput();
  }

  debug("instantiated.");

  return this;
}
inherits(Input, Readable);

Input.prototype._audioCallback = function(size, message) {
  if (this._audioBuffers.push(message) > MAX_BUFFERS) {
    debug('exceeded MAX_BUFFERS, shifting older buffers');
    this._audioBuffers.splice(0, this._audioBuffers.length - MAX_BUFFERS);
  }
  this.read(0);
};

Input.prototype._read = function(n) {
  debug("_read()");
  var chunk = this._audioBuffers.pop();
  if (typeof chunk !== 'undefined') {
    debug("_read() pushing data");
    this.push(chunk);
  }
  else {
    if (input.isOpen()) {
      debug("_read() pushing blank string");
      this.push('');
    }
    else {
      debug("_read() input is closed. push null");
      this.push(null);
    }
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
  }
};

module.exports = Input;
