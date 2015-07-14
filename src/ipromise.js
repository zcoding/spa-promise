var utils = {};

utils.isFunction = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

  /**
   * 将成功或失败回调加入异步队列队尾
   * @param {iPromise} promise
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   */
  function handle(promise, onFulfilled, onRejected) {
    if (promise._state === FULFILLED) {
      onFulfilled(promise._value);
      return;
    }
    if (promise._state === REJECTED) {
      onRejected(promise._value);
      return;
    }
    setTimeout(function() { // always async
      if (utils.isFunction(onFulfilled)) {
        promise._FCallbacks.push(onFulfilled);
      }
      if (utils.isFunction(onRejected)) {
        promise._RCallbacks.push(onRejected);
      }
    }, 0);
  }

  function thenable(x) {
    var t = typeof x;
    if (x && (t === 'object' || t === 'function') && typeof x.then === 'function') {
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
      if (then) { // thenable
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

  /**
   * change the status to `FULFILLED` and invoke callbacks
   * @param {iPromise} promise
   * @param {Object} value
   */
  function fulfill(promise, value) {
    promise._state = FULFILLED;
    promise._value = value;
    for (var i = 0, len = promise._FCallbacks.length; i < len; ++i) {
      promise._FCallbacks[i](value) // what is `this` here ?
    }
    promise._FCallbacks.splice(0); // 清空
  }

  /**
   * change the status to `REJECTED` and invoke callbacks
   * @param {iPromise} promise
   * @param {Obejct} error
   */
  function reject(promise, error) {
    promise._state = REJECTED;
    promise._value = error;
    for (var i = 0, len = promise._RCallbacks.length; i < len; ++i) {
      promise._RCallbacks[i](error);
    }
    promise._RCallbacks.splice(0); // 清空
  }

  /**
   * @class iPromise
   * @param {Function} resolver
   * @constructor
   */
  function iPromise(resolver) {

    this._state = PENDING;
    this._value = null;
    this._FCallbacks = []; // FULFILLED 异步队列
    this._RCallbacks = []; // REJECTED 异步队列

    var promise = this;

    resolver(function(value) { // 先执行同步代码
      resolve(promise, value);
    }, function(error) {
      reject(promise, error);
    });

  }

  var prtt = iPromise.prototype;

  /**
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {iPromise} always return a new Promsie
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
   * @return {iPromsie} always return a new Promise
   */
  prtt.catch = function(onRejected) {
    return this.then(null, onRejected);
  };

  /**
   * @static resolve
   * @param {Object} value
   * @return {iPromise}
   */
  iPromise.resolve = function(value) {
    return new iPromise(function(resolve, reject) {
      resolve(value);
    });
  };

  /**
   * @static reject
   * @param {Object} error
   * @return {iPromise}
   */
  iPromise.reject = function(error) {
    return new iPromise(function(resolve, reject) {
      reject(error);
    });
  };

  /**
   * @static all
   * @param {Array} promises
   * @return {iPromise}
   */
  iPromise.all = function(promises) {
    var accumulator = [];
    var ready = iPromise.resolve(null);
    for (var i = 0, len = promises.length; i < len; ++i) {
      var promise = promises[i];
      ready = ready.then(function () {
        return promise;
      }).then(function (value) {
        accumulator.push(value);
      });
    }
    return ready.then(function () { return accumulator; });
  };

  /**
   * @static race
   * @param {Array} promises
   * @return {iPromise}
   */
  iPromise.race = function(promises) {
    return new iPromise(function(resolve, reject) {
      var onlyOne = true;
      for (var i = 0, len = promises.length; i < len; ++i) {
        var promise = promises[i];
        promise.then(function(value) {
          if (onlyOne) {
            onlyOne = false;
            resolve(value);
          }
        }, function(error) {
          if (onlyOne) {
            onlyOne = false;
            reject(error);
          }
        });
      }
    });
  };

  return iPromise;

})();
