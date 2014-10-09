var middleware = module.exports = function (options) {
  var originals = {};
  var override = (options && options.override) || ['json', 'jsonp'];
  var isPromise = function (value) { return value && typeof value.then === "function"; };

  return function (req, res, next) {
    override.forEach(function (method) {
      var original = originals[method] = res[method].bind(res);

      res[method] = function (response) {
        if (isPromise(response)) {
          response.then(original, next);
          return res;
        }
        return original(response);
      };
    });
    next();
  };
};