# spa-promise
Promises/A+ implementation

## about Promises/A+
[Promises/A+ official site](https://promisesaplus.com/)

[Promises/A+ Github](https://github.com/promises-aplus/promises-spec)

## simple usage example

### in browser
```html
<script src="/build/ipromise.js"></script>
<!-- min version -->
<script src="/build/ipromise.min.js"></script>
```

```javascript
var myPromise = new iPromise(function(resolve, reject) {
    setTimeout(function() {
        try {
            var result = syncProcess();
            resolve(result);
        } catch(err) {
            reject(err);
        }
    }, 1000);
});
myPromise.then(function(result) {
    console.log('I get the result: ' + result);
}, function(err) {
    console.log('Something wrong.' + err);
});
```

### in node.js
```javascript
var iPromise = require('./spa-promise').iPromise;
// ...
```

[more examples](https://github.com/zcoding/spa-promise/tree/master/demo)

## api

+ `.then(onFulfilled, onRejected)` [usage](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)

+ `.catch(onRejected)` [usage](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)

+ `iPromise.resolve(value)` [usage](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)

+ `iPromise.reject(reason)` [usage](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject)

+ `iPromise.all(promises)` [usage](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

+ `iPromise.race(promises)` [usage](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

## development

+ `gulp dev` or `npm run dev` for development
+ `gulp build` or `npm run build` for browser-version build
+ `gulp release` or `npm run release` for zip file
+ `npm test` for test
