var bindings = require('./bindings');
var inherits = require('util').inherits;
var Readable = require('readable-stream/readable');
var debug = require('debug')('coreaudio:input');

module.exports = Input;

function Input(opts) {
  if (!(this instanceof Input)) {
    return new Input(opts);
  }
  Readable.call(this, opts);

  if (!opts) opts = {};

  bindings.input(this.readTest);
  //console.log(bindings);
}
inherits(Input, Readable);

Input.prototype.readTest = function(err, data) {
  console.log(data);
};
