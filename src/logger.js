'use strict';

var config = require('./config'),
    git = require('gitftw'),
    colors = require('colors/safe');

git.events.on('command', function(command) {
  log('info', colors.grey('git: '))(colors.grey.bold(command));
});

//Add a listener to the result of the git command. Output it with >
git.events.on('result', function(res) {
  res.split('\n').forEach(function(line) {
    log('log', colors.grey('git: '))(colors.grey('> ' + line));
  });
});

/**
 * @private
 * @param {String} type
 * @param {String} prefix
 * @returns {Function}
 */
function log(type, prefix) {
  return function() {
    if (config.get('verbose')) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(prefix);
      if (type === 'error') {
        args = args.map(function(line) {
          return colors.red.bold(line);
        });
      } else if (type === 'success') {
        args = args.map(function(line) {
          return colors.green.bold(line);
        });
        type = 'info';
      } else {
        args = args.map(function(line) {
          return colors.blue(line);
        });
      }
      console[type].apply(console, args);
    }
  };
}
/**
 * Logging for snap
 *
 */
module.exports = ['log', 'info', 'warn', 'error', 'success'].reduce(function(memo, type) {
    memo[type] = log(type, 'snap:');
    return memo;
  }, {});
