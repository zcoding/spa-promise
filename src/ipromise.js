var utils = {};

utils.isFunction = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

  function handle(promise, onFulfilled, onRejected) {
    promise._callbacks.push({
      "fulfill": onFulfilled,
      "reject": onRejected
    });
    setTimeout(function() { // always async
      for (var i = 0; i < promise._callbacks.length; ++i) {
        var _callback = promise._callbacks[i];
        if (promise._state === PENDING) {
          continue;
        }
        if (promise._state === FULFILLED) {
          _callback['fulfill']();
        }
        if (promise._state === REJECTED) {
          _callback['reject']();
        }
        promise._callbacks.splice(i, 1);
      }
    }, 0);
  }

  function thenable(x) {
    var t = typeof x;
    if (value && (t === 'object' || t === 'function') && typeof x.then === 'function') {
        return x.then;
    }
    return false;
  }

  /**
   * promise resolution procedure
   * @param {iPromise} promise
   * @param {Object} x
   */
  function resolve(promise, x) {
    if (promise === x) {
      reject(promise, new TypeError('The promise and its value refer to the same object"'));
      return;
    }
    try {
      var then = thenable(x);
      if (then) { // iPromise or thenable
        then.call(x, function(value) {
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
  }

  function reject(promise, error) {
    promise._state = REJECTED;
    this._value = error;
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

    resolver(function(value) {
      resolve(promise, value);
    }, function(error) {
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
      handle(oldPromise, function(value) { // pending until old promise is resolved or rejected
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
   * @param {Object} obj
   * @return {iPromise}
   */
  iPromise.resolve = function(obj) {};

  /**
   * @static reject
   * @param {Object} obj
   * @return {iPromise}
   */
  iPromise.reject = function(obj) {};

  /**
   * @static all
   * @param {Array} promises
   * @return {iPromise}
   */
  iPromise.all = function(promises) {};

  /**
   * @static race
   * @param {Array} promises
   * @return {iPromise}
   */
  iPromise.race = function(promises) {};

  return iPromise;

})();
