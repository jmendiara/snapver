'use strict';
var Promise = require('bluebird'),
    config = require('../config'),
    logger = require('../logger'),
    managers = require('../managers'),
    git = require('gitftw');


module.exports = statusProcess;

function statusProcess(cb) {
  var mngs = managers();
  return mngs.getVersion()
      .then(function(currentVersion) {
        return {
          current: currentVersion
        }
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

