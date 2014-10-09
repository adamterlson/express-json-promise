var middleware = module.exports = function (options) {
  var originals = {};
  var overrides = (options && options.overrides) || ['json'];
  var isPromise = function (value) { return value && typeof value.then === "function"; };

  return function (req, res, next) {
    overrides.forEach(function (override) {
      var original = originals[override] = res[override].bind(res);

      res[override] = function (response) {
        if (isPromise(response)) {
          response.then(original, next);
        } else {
          return original.apply(res, arguments);
        }
        return res;
      };
    });
    next();
  };
};