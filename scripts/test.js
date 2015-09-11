var iPromise = require('../src/ipromise').iPromise;

var myPromise = new iPromise(function(resolve, reject) {
  setTimeout(function() {
    resolve('shit');
  }, 3000);
});

console.log('now wait...');

myPromise.then(function(result) {
  console.log('I got ' + result);
});
