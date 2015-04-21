(function () {

  var PENDING = 0, FULFILLED = 1, REJECTED = 2;

  var utils = {
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  };

  var fulfill = function() {
    this.state = FULFILLED;
    for (var i = 0, len = this.handlers.length; i < len; ++i) {
      var fulfilled = this.handlers[i].onFulfilled;
      if (utils.isFunction(fulfilled)) {
        fulfilled(this.value);
      }
    }
  };

  var reject = function() {
    this.state = REJECTED;
    for (var i = 0, len = this.handlers.length; i < len; ++i) {
      var rejected = this.handlers[i].onRejected;
      if (utils.isFunction(rejected)) {
        rejected(this.value);
      }
    }
  };

  /**
   * iPromise
   * @constructor
   * @param {Function} fn
   */
  var iPromise = window.iPromise = function(fn) {
    this.state = PENDING;
    this.value = null;
    this.handlers = [];
    var self = this;
    fn(function(result) {
      self.value = result;
      fulfill.call(self);
    }, function(err) {
      self.value = err;
      reject.call(self);
    });
  };

  iPromise.prototype.done = function(onFulfilled, onRejected) {
    var self = this;
    // 保证所有回调都是异步的
    setTimeout(function() {
      handle.call(self, {
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  };

  /**
   * then
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {Object} a new iPromise instance
   */
  iPromise.prototype.then = function(onFulfilled, onRejected) {
    var self = this;
    return new iPromise(function(resolve, reject) {
      // then方法总是返回一个新的Promise对象，这个新的Promise对象用于链式传递
      // 为了保证下一个Promise的回调在当前Promise的回调之后执行（链式执行）
      var that = this;
      self.done(function(result) {
        fulfill.call(that, onFulfilled(result));
      }, function(error) {
        reject.call(that, onRejected(error));
      });
    });
  };

  /**
   * all
   */
  iPromise.all = function() {};

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