(function () {

  var PENDING = 0, FULFILLED = 1, REJECTED = 2;

  var utils = {
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  };

  var fulfill = function() {
    this.state = FULFILLED;
    for (var i = 0, len = this.handlers.length; i < len; ++i) {
      var fulfilled = this.handlers[i].onFulfilled;
      if (utils.isFunction(fulfilled)) {
        fulfilled(this.value);
      }
    }
  };

  var reject = function() {
    this.state = REJECTED;
    for (var i = 0, len = this.handlers.length; i < len; ++i) {
      var rejected = this.handlers[i].onRejected;
      if (utils.isFunction(rejected)) {
        rejected(this.value);
      }
    }
  };

  /**
   * iPromise
   * @constructor
   * @param {Function} fn fn带有两个参数，一个是成功回调的执行函数，另一个是失败回调的执行函数
   */
  var iPromise = window.iPromise = function(fn) {
    this.state = PENDING;
    this.value = null;
    this.handlers = [];
    var self = this;
    doResolve(fn, resolve, reject);
  };

  /**
   * 根据传入参数是否为thenable来执行fulfill或者doResolve，如果出错就执行reject
   * @param {any} result
   */
  var resolve = function(result) {
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
  };

  iPromise.reject = function() {};

  iPromise.all = function() {};

  iPromise.prototype.done = function(onFulfilled, onRejected) {
    var self = this;
    // 保证所有回调都是异步的
    setTimeout(function() {
      handle.call(self, {
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  };

  /**
   * then
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {Object} a new iPromise instance
   */
  iPromise.prototype.then = function(onFulfilled, onRejected) {
    var self = this;
    return new iPromise(function(resolve, reject) {
      // then方法总是返回一个新的Promise对象，这个新的Promise对象用于链式传递
      // 为了保证下一个Promise的回调在当前Promise的回调之后执行（链式执行）
      self.done(function(result) {
        // 如果onFulFilled是一个函数（必定有一个返回值x）
        if (utils.isFunction(onFulfilled)) {
          try {
            resolve(onFulfilled(result));
          } catch (ex) {
            reject(ex);
          }
        } else { // 如果onFulfilled不是一个函数，但上一级Promise成功执行
          resolve(result);
        }
      }, function(error) {
        // 如果onRejected是一个函数（必定有一个返回值x）
        if (utils.isFunction(onRejected)) {
          try {
            resolve(onRejected(error));
          } catch(ex) {
            reject(ex);
          }
        } else { // 如果onRejected不是一个函数，但上一级Promise拒绝执行
          reject(error);
        }
      });
    });
  };

  /**
   * iPromise.all 别名：iPromise.when
   * 当promise列表中的所有promise都满足的时候才满足
   * @param {Array} promises
   * @return {iPromise}
   */
  iPromise.all = iPromise.when = function(promises) {
    return new iPromise(function(resolve, reject) {
    });
  };

  /**
   * iPromise.race 别名：iPromise.once
   * 当promise列表中有一个promise满足时就满足
   * @param {Array} promises
   * @return {iPromise}
   */
  iPromise.race = iPromise.once = function(promises) {};

  /**
   * 将传入参数转换为iPromise对象
   * @param {Any} any
   * @return {iPromise}
   */
  iPromise.resolve = function(any) {};

  /**
   * 将传入参数转换为iPromise对象，状态为rejected
   * @param {Any} any
   * @return {iPromise}
   */
  iPromise.reject = function(any) {
    return new iPromise(function(resolve, reject) {
      reject(any);
    });
  };

  var handle = function(handler) {
    var state = this.state;
    switch(state) {
      case PENDING: this.handlers.push(handler);break;
      case FULFILLED: handler.onFulfilled.call(null, this.value);break;
      case REJECTED: handler.onRejected.call(null, this.value);break;
      default: throw new Error('The state number is illegal.');
    }
  };

  /**
   * 确保onFulfilled和onRejected函数只执行其中一个一次
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

})();