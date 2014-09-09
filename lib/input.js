var bindings = require('./bindings');
var inherits = require('util').inherits;
var Readable = require('readable-stream/readable');
var debug = require('debug')('osxaudio:input');
var uvcf = require('uvcf');

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

  this._buffers = [];
  process.nextTick(function() {
    bindings.input(self._receiveData.bind(self));
  });
  debug("instantiated.");

  return this;
}
inherits(Input, Readable);

Input.prototype._init = function() {
  debug("_init()");
  
  // initialize our bindings, passing in our buffer-receiving function
};

Input.prototype._receiveData = function(err, data) {
  if (!this.joined) {
    debug('joining with cfrunloop');
    uvcf.ref();
    this.joined = true;
  }
  if (err) {
    // we'll want to send EOF since something tanked
    this._buffers.push(null);
  }
  else {
    // push the newly available data into the buffer list
    if (this._buffers.push(data) > MAX_BUFFERS) {
      debug('exceeded MAX_BUFFERS, shifting older buffers');
      this._buffers.splice(0, this._buffers.length - MAX_BUFFERS);
    }
  }
};

Input.prototype._read = function() {
  debug("_read()");
  var chunk = this._buffers.pop();
  if (typeof chunk !== 'undefined') {
    this.push(chunk);
  }
  else {
    this.push('');
  }
};
