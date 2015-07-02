# spa-promise
Promises/A+ API for Single Page Application

## Promises/A+
[Promises/A+](https://promisesaplus.com/)是一个为健全可互操作的JavaScript Promise制定的开放标准。

[https://github.com/promises-aplus/promises-spec](https://github.com/promises-aplus/promises-spec)

## How to
example:
```javascript
var myPromise = new iPromise(function(fulfill, reject) {
    setTimeout(function() {
        try {
            var result = syncProcess();
            fulfill(result);
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
example with aja:
```javascript
aja('/api/demo').get({page: 1})
  .then(function(response) {
    console.log('Get response: ' + response);
  }, function(error) {
    console.log('Aja error: ' + error);
  })
  .then(JSON.parse)
  .then(function(json) {
    console.log('Get json: ', json);
  });
```
##chain
`then`方法可以链式调用，`then`方法总是返回一个<strong>新的</strong>iPromise对象。
```javascript

```
## Static API

###`.resolve(value)`

###`.reject(value)`

###`.all(promises)`

###`.race(promise)`
