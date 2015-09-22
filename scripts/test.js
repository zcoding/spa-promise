var iPromise = require('../src/promise').iPromise;

var promisesAplusTests = require("promises-aplus-tests");

var adapter = {
  resolved: iPromise.resolve,
  rejected: iPromise.reject,
  deferred: function() {
    var p = new iPromise(function(resolve, reject) {
      setTimeout(function() {
        resolve(123);
      }, 3000);
    });
    return {
      promise: p,
      resolve: p.then.bind(p),
      reject: p.catch.bind(p)
    };
  }
};

promisesAplusTests(adapter, function (err) {
  if (err) console.log(err);
});
