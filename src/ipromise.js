window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

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

  function iPromise(fn) {
    if (!this instanceof iPromise) return new iPromise(fn);

    var state = PENDING;
    var value = null;
    var handlers = [];

    function fulfill(result) {
      state = FULFILLED;
      value = result;
      handlers.forEach(handle);
      handlers = null;
    }

    function reject(error) {
      state = REJECTED;
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
      if (state === PENDING) {
        handlers.push(handler);
      } else {
        if (state === FULFILLED && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(value);
        }
        if (state === REJECTED && typeof handler.onRejected === 'function') {
          handler.onRejected(value);
        }
      }
    }

    this.done = function (onFulfilled, onRejected) {
      setTimeout(function () {
        handle({
          onFulfilled: onFulfilled,
          onRejected: onRejected
        });
      }, 0);
    }

    doResolve(fn, resolve, reject);

  }

  iPromise.prototype.then = function(onFulfilled, onRejected) {
    var self = this;
    return new iPromise(function (resolve, reject) {
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
  };

  ///// 静态方法 /////
  iPromise.resolve = function() {};

  iPromise.reject = function() {};

  iPromise.all = function() {};

  iPromise.race = function() {};

  ///// 静态方法别名 /////
  iPromise.when = iPromise.all;
  iPromise.one = iPromise.race;

  return iPromise;

})();