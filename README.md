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
example with ajax:
```javascript
var getview = new iPromise(function(fulfill, reject) {
    $.ajax({
        url: '/path/to/view',
        success: function(res) {
            fulfill(res);
        },
        error: function(err) {
            reject(err);
        }
    });
});
getView.then(function(res) {
    console.log(res);
}, function(err) {
    console.log(err);
});
```
##chain
`then`方法可以链式调用，`then`方法总是返回一个<strong>新的</strong>iPromise对象。
```javascript
var myPromise = new iPromise(function(fulfill, reject) {
    setTimeout(function() {
        if (condition) {
            fulfill(123);
        } else {
            reject(new Error('no'));
        }
    }, 1000);
});
```
