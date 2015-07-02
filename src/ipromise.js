window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

  function invokeCallbacks(callbacks) {}

  function addToCallbacks(promise, onFulfilled, onRejected) {}

  function thenable(x) {
    var t = typeof x;
    if (value && (t === 'object' || t === 'function') && typeof x.then === 'function') {
        return true;
    }
    return false;
  }

  /**
   * promise resolution procedure
   * @param {iPromise} promise
   * @param {Object} x
   */
  function resolve(promise, x) {
    if (promise === x) { // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
      reject(promise, new TypeError('The promise and its value refer to the same object"'));
      return;
    }
    try {
      if (thenable(x)) { // iPromise or thenable
        x.then(function(value) {
          resolve(promise, value);
        }, function(error) {
          reject(promise, error);
        });
        return;
      }
      fulfill(promise, x);
    } catch (e) {
      reject(promise, e);
    }
  }

  function fulfill(promise, value) {
    promise._state = FULFILLED;
    this._value = value;
    invokeCallbacks(promise._callbacks);
  }

  function reject(promise, error) {
    promise._state = REJECTED;
    this._value = error;
    invokeCallbacks(promise._callbacks);
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
    var oldPromsie = this;
    addToCallbacks(this, onFulfilled, onRejected);
    return new iPromise(function(resolve, reject) {
      oldPromise.then(function(value) {
        resolve(value);
      }, function(error) {
        reject(error);
      });
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
