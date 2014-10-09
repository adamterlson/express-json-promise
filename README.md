[![Build Status](https://travis-ci.org/adamterlson/express-json-promise.svg?branch=master)](https://travis-ci.org/adamterlson/express-json-promise)

express-json-promise
====================

Adds support to res.json method for passing a promise directly.  If promise is rejected, will automatically call error-handling middleware.

##Usage

With express-json-promise, you can pass a promise for your async workflow directly to res.json methods.  If the promise is successful, the native `res.json` method is called for you with the result.  If it rejects via an exception, that exception object is passed to express' `next` function, triggering the error-handling middleware for you.

``````javascript
var app = express();
app.use(require('express-json-promise')());
app.get('/foo', function (req, res) {
  var workflow = doSomethingAsync()
    .then(doSomethingElse)
    .then(anotherThing)
    .then(function (result) {
      if (result === 'happy') {
        return { result: 'stuff' };
      }
      // No need to call res.json or set status!  Throw as per usual.
      throw new Error("Massive Failure!");
    });
    
  res.json(workflow); // So easy!
});

// ErrorHandler will be triggered with the thrown exception above, just as one would expect!
app.use(function ErrorHandler(err, req, res, next) {
  res.status(500);
  res.json({ message: 'Something Failed!', details: err });
});
```````

The `options` parameter to the middleware allows selection of which methods you wish to override.  By default, it'll override both `json` and `jsonp` methods.  Technically you can override any method on `res`, but not all will behave as you might expect.

`````javascript
app.use(require('express-json-promise')({ override: ['jsonp'] }));
`````````
By doing this, the `json` method will be left alone and retain its default lack-of-promisey-goodness-support state.

#### Why don't you just override `send`?
[Because](https://github.com/strongloop/express/blob/master/lib/response.js#L228).
