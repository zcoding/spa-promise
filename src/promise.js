var PENDDING = 0,
    FULFILLED = 1,
    REJECTED = 2; 
    
function resolve() {}

function reject(promise) {
  if (promise._state === PENDDING) {
    promise._state = REJECTED;
    setTimeout(function() {
      execCallbacks(promise);
    }, 0);
  }
}

function iPromise(resolver) {
  this._value = null;
  this._state = PENDDING;
  this._callbacks = [];
  
  var promise = this;
  // do resolver
  resolver(function() {
    resolve(promise);
  }, function() {
    reject(promise);
  });
}

iPromise.prototype.then = function() {};

iPromise.prototype.catch = function() {};

iPromise.all = function() {};

iPromise.race = function() {};

iPromise.resolve = function() {};

iPromise.reject = function() {};
