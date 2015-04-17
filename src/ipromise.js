(function () {

  var PENDING = 0, FULFILLED = 1, REJECTED = 2;

  /**
   * iPromise
   * @constructor
   * @param {Function} fn
   */
  var iPromise = window.iPromise = function(fn) {
    this.state = PENDING;
    this.value = null;
    this.handlers = [];
  };

  iPromise.prototype.then = function(onFulfilled, onRejected) {
    var self = this;
    return new iPromise(function(resolve, reject) {});
  };

  iPromise.prototype.done = function(onFulfilled, onRejected) {
    ssetTimeout(function() {
      handle.call(this, {
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  };

  var handle = function(handler) {
    var state = this.state;
    switch(state) {
      case PENDING: this.handlers.push(handler);break;
      case FULFILLED: handler.onFulfilled.call(null, this.value);break;
      case REJECTED: handler.onRejected.call(null, this.value);break;
      default: throw new Error('The state number is illegal.');
    }
  };

})();