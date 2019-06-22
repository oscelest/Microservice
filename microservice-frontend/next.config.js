const withLess = require("@zeit/next-less");

module.exports = withLess({
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll:             1000,   // Check for changes every second
      aggregateTimeout: 300,   // delay before rebuilding
    };
    return config;
  },
});
