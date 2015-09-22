/*/
/// author: zcoding
/// version: 0.3.0
/// repository: https://github.com/zcoding/spa-promise.git
/*/

(function(exports) {

var PENDING = 0,
    FULFILLED = 1,
    REJECTED = 2; 

var isFunction = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

function thenable(x) {
  var t = typeof x;
  if (x && (t === 'object' || t === 'function') && typeof x.then === 'function') { // 2.3.3
    return x.then;
  }
  return false;
}

function asyncCall(cb) {
  setTimeout(cb, 0);
}

function execCallbacks(promise, valueORreason) {
  if (promise._state === PENDING) {
    return;
  } else if (promise._state === FULFILLED) {
    for (var i = 0; i < promise._fulfillCallbacks.length; ++i) {
      promise._fulfillCallbacks[i].call(null, valueORreason); // 2.2.5
    }
    promise._fulfillCallbacks.splice(0);
  } else if (promise._state === REJECTED) {
    for (var i = 0; i < promise._rejectCallbacks.length; ++i) {
      promise._rejectCallbacks[i].call(null, valueORreason); // 2.2.5
    }
    promise._rejectCallbacks.splice(0);
  }
}

/**
 * 2.3 The Promise Resolution Procedure
 * @param {iPromise} promise
 * @param {Object} x
 */
function resolve(promise, x) {
  if (promise === x) {
    reject(promise, new TypeError('The promise and its value refer to the same object.')); // 2.3.1
  } else if (x && x.constructor === iPromise) { // 2.3.2
    if (x._state === PENDING) { // 2.3.2.1
      x.then(function(_value) {
        fulfill(promise, _value); // 2.3.2.2
      }, function(_reason) {
        reject(promise, _reason); // 2.3.2.3
      });
    } else if (x._state === FULFILLED) {
      fulfill(promise, x._value); // 2.3.2.2
    } else if (x._state === REJECTED) {
      reject(promise, x._reason); // 2.3.2.3
    }
  } else {
    var firstCall = true;
    try {
      var then = thenable(x); // 2.3.3.1
      if (then) {
        then.call(x, function(y) { // 2.3.3.3
          if (firstCall) { // 2.3.3.3.3
            resolve(promise, y); // 2.3.3.3.1
            firstCall = false;
          }
        }, function(r) {
          if (firstCall) { // 2.3.3.3.3
            reject(promise, r); // 2.3.3.3.2
            firstCall = false;
          }
        });
      } else {
        fulfill(promise, x); // 2.3.3.4, 2.3.4
      }
    } catch (e) {
      if (firstCall) { // 2.3.3.3.3
        reject(promise, e); // 2.3.3.2
        firstCall = false;
      }
    }
  }
}

function fulfill(promise, value) {
  if (promise._state === PENDING) {
    promise._state = FULFILLED;
    promise._value = value;
    asyncCall(function() {
      execCallbacks(promise, value);
    });
  }
}

function reject(promise, reason) {
  if (promise._state === PENDING) {
    promise._state = REJECTED;
    promise._reason = reason;
    asyncCall(function() {
      execCallbacks(promise, reason);
    });
  }
}

function iPromise(resolver) {
  this._value = null;
  this._reason = null;
  this._state = PENDING;
  this._fulfillCallbacks = [];
  this._rejectCallbacks = [];
  
  var promise = this;
  // do resolver
  resolver(function(value) {
    resolve(promise, value);
  }, function(reason) {
    reject(promise, reason);
  });
}

iPromise.prototype.then = function(onFulfilled, onRejected) {
  var thisPromise = this;
  var thenPromise = new iPromise(function(thenResolve, thenReject) {
    thisPromise._fulfillCallbacks.push(function(thisValue) { // 2.2.6.1
      if (isFunction(onFulfilled)) { // 2.2.1.1
        try {
          var afterOnFulfilled = onFulfilled(thisValue); // 2.2.2.1
          thenResolve(afterOnFulfilled); // 2.2.7.1
        } catch (exception) { // 2.2.7.2
          thenReject(exception);
        }
      } else {
        thenResolve(thisValue); // 2.2.7.3
      }
    });
    thisPromise._rejectCallbacks.push(function(thisReason) { // 2.2.6.2
      if (isFunction(onRejected)) { // 2.2.1.2
        try {
          var afterOnRejected = onRejected(thisReason); // 2.2.3.1
          thenResolve(afterOnFulfilled);
        } catch(exception) { // 2.2.7.2
          thenReject(exception);
        }
      } else {
        thenReject(thisReason); // 2.2.7.4
      }
    });
  });
  return thenPromise; // 2.2.7
};

iPromise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

/**
 * iPromise.all(promises)
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
 * iPromise.race(promises)
 * @static
 * @param {Array} promises
 * @return {iPromise}
 */
iPromise.race = function(promises) {
  return new iPromise(function(_resolve, _reject) {
    var onlyOne = true;
    for (var i = 0, len = promises.length; i < len; ++i) {
      var promise = promises[i];
      promise.then(function(value) {
        if (onlyOne) {
          onlyOne = false;
          _resolve(value);
        }
      }, function(error) {
        if (onlyOne) {
          onlyOne = false;
          _reject(error);
        }
      });
    }
  });
};

iPromise.resolve = function(value) {
  return new iPromise(function(_resolve, _reject) {
    _resolve(value);
  });
};

iPromise.reject = function(reason) {
  return new iPromise(function(_resolve, _reject) {
    _reject(reason);
  });
};

exports.iPromise = iPromise;

})(window);
