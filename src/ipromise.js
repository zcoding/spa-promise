window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

  /**
   * promise resolution procedure
   * @param {iPromise} promise
   * @param {Object} x
   */
  function resolve(promise, x) {
    if (promise === x) { // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
      reject(promise, new TypeError('The promise and its value refer to the same object"'));
    }

    if (x instanceof iPromise) {
      x.then(function(value) {
      }, function(reason) {
      });
    }
  }

  function reject(promise, error) {
    promise._state = REJECTED;
    invokeRejectList(promise, error);
  }

  /**
   * @class iPromise
   * @param {Function} resolver
   * @constructor
   */
  function iPromise(resolver) {

    this._state = PENDING;
    this._value = null;
    this._callbacks = [];

    var promise = this;

    resolver(function fulfilled(value) {
      resolve(promise, value);
    }, function rejected(error) {
      reject(promise, error);
    });

  }

  var prtt = iPromise.prototype;

  /**
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {iPromise}
   */
  prtt.then = function(onFulfilled, onRejected) {
    return new iPromise(function(resolve, reject) {
    });
  };

  /**
   * @param {Function} onRejected
   * @return {iPromsie}
   */
  prtt.catch = function(onRejected) {
    return this.then(null, onRejected);
  };

  /**
   * @static resolve
   * @param {Function} resolver
   * @return {iPromise}
   */
  iPromise.resolve = function() {};

  iPromise.reject = function() {};

  iPromise.all = function() {};

  iPromise.race = function() {};

  return iPromise;

})();
