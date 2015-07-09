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
  })
  .catch(function(error) {
    // deal with error
  });
```
##chain
`then`方法可以链式调用，`then`方法总是返回一个<strong>新的</strong>iPromise对象。
```javascript
doSomething()
  .then(doSomethingElse)
  .then(doAnotherThing)
  .catch(dealWithError)
```
在这里，`doSomething`|`doSomethingElse`|`doAnotherThing`都返回一个Promise，虽然每个函数内部都是异步的，但总能保证先完成doSomething，再做doSomethingElse，最后做doAnotherThing
## Static API

###`.resolve(value)`

###`.reject(value)`

###`.all(promises)`

###`.race(promise)`
