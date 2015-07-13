var koa = require('koa');
var app = koa();
var router = require('koa-router')();
var serve = require('koa-static');
var path = require('path');

var responseTime = function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
};

router.get('/', function *(next) {
  this.body = 'Hello World!';
});

app.use(serve(path.resolve(__dirname, '../demo')))
  .use(serve(path.resolve(__dirname, '../src')))
  .use(responseTime)
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(9090);
