/*/
/// author: zcoding
/// version: 0.1.0
/// repository: https://github.com/zcoding/spa-promise.git
/*/

(function(exports) {

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
function next(promise, onFulfilled, onRejected) {
  if (isFunction(onFulfilled)) {
    promise._FCallbacks.push(onFulfilled);
  }
  if (isFunction(onRejected)) {
    promise._RCallbacks.push(onRejected);
  }
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
    reject(promise, new TypeError('The promise and its value refer to the same object.'));
  } else if (x && x.constructor === iPromise) {
    if (x._state === PENDING) { // 如果x未完成，先等x完成，再执行promise
			x.then(function (val) {
				resolve(promise, val);
			}, function (reason) {
				reject(promise, reason);
			})
		}
		else if (x._state === FULFILLED) {
			fulfill(promise, x._value);
		}
		else if (x._state === REJECTED) {
			reject(promise, x._value);
		}
  } else {
    var done = false; // 保证只调用一次
    try {
      var then = thenable(x);
      if (then) { // thenable
        then.call(x, function(y) { // 如果是thenable，先等thenable完成，再执行promise
          done || resolve(promise, y);
          done = true;
        }, function(r) {
          done || reject(promise, r);
          done = true;
        });
      } else {
        fulfill(promise, x);
      }
    } catch (e) {
      done || reject(promise, e);
    }
  }
}

/**
 * change the status to `FULFILLED` and invoke callbacks
 * @param {iPromise} promise
 * @param {Object} value
 */
function fulfill(promise, value) {
  if (promise._state !== PENDING) {
		return;
	}
  promise._state = FULFILLED;
  promise._value = value;
  setTimeout(function() {
    for (var i = 0, len = promise._FCallbacks.length; i < len; ++i) {
      promise._FCallbacks[i].call(null, value);
    }
    promise._FCallbacks.splice(0); // once fufilled, empty callback queue
  }, 0);
}

/**
 * change the status to `REJECTED` and invoke callbacks
 * @param {iPromise} promise
 * @param {Obejct} error
 */
function reject(promise, error) {
  if (promise._state !== PENDING) {
		return;
	}
  promise._state = REJECTED;
  promise._value = error;
  setTimeout(function() {
    for (var i = 0, len = promise._RCallbacks.length; i < len; ++i) {
      promise._RCallbacks[i].call(null, error);
    }
    promise._RCallbacks.splice(0); // once rejected, empty callback queue
  }, 0);
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

  try {
    resolver(function(value) {
      resolve(promise, value);
    }, function(error) {
      reject(promise, error);
    });
  } catch(err) {
    reject(promise, err);
  }

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
  var thenPromise = new iPromise(function(resolve, reject) {
    next(oldPromise, function(value) { // pending until old promise is resolved or rejected
      if (isFunction(onFulfilled)) {
        try {
          resolve(onFulfilled(value));
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(value);
      }
    }, function(reason) {
      if (isFunction(onRejected)) {
        try {
          resolve(onRejected(reason));
        } catch (error) {
          reject(error);
        }
      } else {
        reject(reason);
      }
    });
  });

  return thenPromise;

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
  var stack = [];
  var ready = iPromise.resolve(null);
  function then(promise) {
    ready = ready.then(function() {
      return promise;
    }).then(function(val) {
      stack.push(val);
    });
  }
  for (var i = 0; i < promises.length; ++i) {
    then(promises[i]);
  }
  return ready.then(function() {
    return stack;
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

})(window);
