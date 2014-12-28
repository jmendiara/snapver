'use strict';
var Promise = require('bluebird'),
    logger = require('../logger'),
    managers = require('../managers');

module.exports = statusProcess;

/**
 * Gets the status of your current developed version
 *
 * @example
 * {
 *   current: 'x.y.z-SUFFIX' //The current version being developed
 * }
 *
 * @param {callback} [cb] The execution callback
 * @returns {Promise} [promise] the execution promise
 */
function statusProcess(cb) {
  var mngs = managers();
  return mngs.getVersion()
      .then(function(currentVersion) {
        return {
          current: currentVersion
        };
      })
      .tap(function() {
        logger.success('Done');
      })
      .catch(function(err) {
        logger.error(err.toString ? err.toString() : err);
        return Promise.reject(err);
      })
      .nodeify(cb);
}
