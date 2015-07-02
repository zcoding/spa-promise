window.iPromise = (function() {

  var FULFILLED = 1, REJECTED = 2, PENDING = 0;

  /**
   * @class iPromise
   * @param {Function} resolver
   * @constructor
   */
  function iPromise(resolver) {
  }

  var prtt = iPromise.prototype;

  /**
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {iPromise}
   */
  prtt.then = function(onFulfilled, onRejected) {
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
