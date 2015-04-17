(function() {

  var STATE = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2
  };

  /**
   * Check if a value is a Promise and, if it is,
   * return the `then` method of that promise.
   *
   * @param {Promise|Any} value
   * @return {Function|Null}
   */
  function getThen(value) {
    var t = typeof value;
    if (value && (t === 'object' || t === 'function')) {
      var then = value.then;
      if (typeof then === 'function') {
        return then;
      }
    }
    return null;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   *
   * @param {Function} fn A resolver function that may not be trusted
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   */
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return
        done = true
        onFulfilled(value)
      }, function (reason) {
        if (done) return
        done = true
        onRejected(reason)
      })
    } catch (ex) {
      if (done) return
      done = true
      onRejected(ex)
    }
  }

  var Promise = window.ZPromise = function(fn) {
    var state = STATE.PENDING;
    var value = null;
    var handlers = [];

    function fulfill(result) {
      state = STATE.FULFILLED;
      value = result;
      handlers.forEach(handle);
      handlers = null;
    }

    function reject(error) {
      state = STATE.REJECTED;
      value = error;
      handlers.forEach(handle);
      handlers = null;
    }

    function resolve(result) {
      try {
        var then = getThen(result);
        if (then) {
          doResolve(then.bind(result), resolve, reject)
          return
        }
        fulfill(result);
      } catch (e) {
        reject(e);
      }
    }

    function handle(handler) {
      if (state === STATE.PENDING) {
        handlers.push(handler);
      } else {
        if (state === STATE.FULFILLED &&
          typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(value);
        }
        if (state === STATE.REJECTED &&
          typeof handler.onRejected === 'function') {
          handler.onRejected(value);
        }
      }
    }

    this.done = function (onFulfilled, onRejected) {
      // ensure we are always asynchronous
      setTimeout(function () {
        handle({
          onFulfilled: onFulfilled,
          onRejected: onRejected
        });
      }, 0);
    }

    this.then = function (onFulfilled, onRejected) {
      var self = this;
      return new Promise(function (resolve, reject) {
        return self.done(function (result) {
          if (typeof onFulfilled === 'function') {
            try {
              return resolve(onFulfilled(result));
            } catch (ex) {
              return reject(ex);
            }
          } else {
            return resolve(result);
          }
        }, function (error) {
          if (typeof onRejected === 'function') {
            try {
              return resolve(onRejected(error));
            } catch (ex) {
              return reject(ex);
            }
          } else {
            return reject(error);
          }
        });
      });
    }

    doResolve(fn, resolve, reject);

  };

})();