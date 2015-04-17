# spa-promise
Promises/A+ API for Single Page Application

## Promises/A+
[Promises/A+](https://promisesaplus.com/)是一个为健全可互操作的JavaScript Promise制定的开放标准。

[https://github.com/promises-aplus/promises-spec](https://github.com/promises-aplus/promises-spec)

## How to
example:

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

##chain
