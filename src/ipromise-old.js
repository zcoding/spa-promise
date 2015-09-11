var toString = Object.prototype.toString,
  isFunction = function(obj) {
    return toString.call(obj) === '[object Function]';
  },
  FULFILLED = 1,
  REJECTED = 2,
  PENDING = 0;

/**
 * handle a callback
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
    if (isFunction(onFulfilled)) {
      promise._FCallbacks.push(onFulfilled);
    }
    if (isFunction(onRejected)) {
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
 * TODO: async bug
 */
function resolve(promise, x) {
  if (promise === x) {
    reject(promise, new TypeError('The promise and its value refer to the same object.'));
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
    promise._FCallbacks[i].call(null, value);
  }
  promise._FCallbacks.splice(0); // once fufilled, empty callback queue
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
    promise._RCallbacks[i].call(null, error);
  }
  promise._RCallbacks.splice(0); // once rejected, empty callback queue
}

/**
 * @class iPromise
 * @param {Function} resolver
 * @constructor
 */
function iPromise(resolver) {

  this._state = PENDING;
  this._value = null;
  this._FCallbacks = []; // FULFILLED callback queue
  this._RCallbacks = []; // REJECTED callback queue

  var promise = this;

  resolver(function(value) {
    resolve(promise, value);
  }, function(error) {
    reject(promise, error);
  });

}

var prtt = iPromise.prototype;

/**
 * .then(onFulfilled, onRejected)
 * @method
 * @param {Function} onFulfilled
 * @param {Function} onRejected
 * @return {iPromise} always return a new Promsie
 */
prtt.then = function(onFulfilled, onRejected) {
  var oldPromise = this;
  return new iPromise(function(resolve, reject) {
    handle(oldPromise, function(value) { // pending until old promise is resolved or rejected
      if (isFunction(onFulfilled)) {
        try {
          resolve(onFulfilled(value));
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(value);
      }
    }, function(error) {
      if (isFunction(onRejected)) {
        try {
          resolve(onRejected(error))
        } catch (ex) {
          reject(ex);
        }
      } else {
        reject(error);
      }
    });
  });
};

/**
 * .catch(onRejected)
 * @method
 * @param {Function} onRejected
 * @return {iPromsie} always return a new Promise
 */
prtt.catch = function(onRejected) {
  return this.then(null, onRejected);
};

/**
 * .resolve(value)
 * @static
 * @param {Object} value
 * @return {iPromise}
 */
iPromise.resolve = function(value) {
  return new iPromise(function(resolve, reject) {
    resolve(value);
  });
};

/**
 * .reject(error)
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
 * .all(promises)
 * @static
 * @param {Array} promises
 * @return {iPromise}
 */
iPromise.all = function(promises) {
  var accumulator = [];
  var ready = iPromise.resolve(null);
  for (var i = 0, len = promises.length; i < len; ++i) {
    var promise = promises[i];
    ready = ready.then(function() {
      return promise;
    }).then(function(value) {
      accumulator.push(value);
    });
  }
  return ready.then(function() {
    return accumulator;
  });
};

/**
 * .race(promises)
 * @static
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

exports.iPromise = iPromise;
