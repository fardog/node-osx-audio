var bindings = require('./bindings');
var inherits = require('util').inherits;
var Readable = require('readable-stream/readable');
var debug = require('debug')('osxaudio:input');

module.exports = Input;

var MAX_BUFFERS = 256;

function Input(opts) {
  if (!(this instanceof Input)) {
    return new Input(opts);
  }
  Readable.call(this, opts);

  var self = this;
  if (!opts) opts = {};
  this.joined = false;

  this._audioBuffers = [];
  bindings.input(self._receiveData.bind(self));
  debug("instantiated.");

  return this;
}
inherits(Input, Readable);

Input.prototype._receiveData = function(err, data) {
  if (err) {
    // we'll want to send EOF since something tanked
    this._audioBuffers.push(null);
  }
  else {
    // push the newly available data into the buffer list
    if (this._audioBuffers.push(data) > MAX_BUFFERS) {
      debug('exceeded MAX_BUFFERS, shifting older buffers');
      this._audioBuffers.splice(0, this._audioBuffers.length - MAX_BUFFERS);
    }
  }
};

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
