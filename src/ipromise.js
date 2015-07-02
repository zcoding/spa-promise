var utils = {};

utils.isFunction = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

  function invokeCallbacks(promise) {
    var _callbacks = promise._callbacks;
    for (var i = 0, len = _callbacks.length; i < len; ++i) {
      var _callback = _callbacks[i];
      //
    }
  }

  function handle(promise, onFulfilled, onRejected) {
    if(promise._state === PENDING) {
      setTimeout(function() { // always async
        promise._callbacks.push({
          "fulfill": onFulfilled,
          "reject": onRejected
        });
      }, 0);
    } else if (promise._state === FULFILLED) {
      onFulfilled(promise._value);
    } else {
      onRejected(promise._value);
    }
  }

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
    invokeCallbacks(promise);
  }

  function reject(promise, error) {
    promise._state = REJECTED;
    this._value = error;
    invokeCallbacks(promise);
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
    var oldPromise = this;
    return new iPromise(function(resolve, reject) {
      handle(oldPromise, function(value) {
        if (utils.isFunction(onFulfilled)) {
          try {
            resolve(onFulfilled(value));
          } catch(error) {
            reject(error);
          }
        } else {
          resolve(value);
        }
      }, function(error) {
        if (utils.isFunction(onRejected)) {
          try {
            resolve(onRejected(error))
          } catch(ex) {
            reject(ex);
          }
        } else {
          reject(error);
        }
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
