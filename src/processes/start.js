'use strict';

var Promise = require('bluebird'),
    config = require('../config'),
    semver = require('semver'),
    logger = require('../logger'),
    managers = require('../managers'),
    git = require('gitftw');

/**
 * Increment a version using snapshot rules
 *
 * @private
 * @param {String} type The type of version increment
 * @param {String} version The current version
 * @returns {String} version The new Version
 */
function incVersion(type, version) {
  var snapshotString = '-' + config.get('suffix');

  if (version.indexOf(snapshotString) !== -1) {
    //remove snapshot
    version = version.substring(0, version.indexOf(snapshotString));
  }
  version = semver.inc(version, type);

  if (version === null) {
    throw new Error('start type must be one of patch, minor, major');
  }

  version += snapshotString;
  logger.info('Bumping to ' + version);
  return version;
}

/**
 * Makes git things
 *
 * @private
 * @param {String} version The version to set in the commit msg
 * @returns {Promise}
 */
function doGit(version) {
  return git.add({
        files: ['.']
      })
      .then(function() {
        return git.commit({
          message: 'Start new version ' + version
        });
      })
      .then(function() {
        return git.push({});
      })
      .return(version);
}

/**
 * Starts a new snapshot version
 * @param {String} type The type of new developing release.
 *   One of [patch, minor, major]
 * @param {callback} [cb] The execution callback
 * @returns {Promise} [promise] The execution promise
 */
function startProcess(type, cb) {
  var mngs = managers();
  return mngs.getVersion()
      .then(function(currentVersion) {
        return incVersion(type, currentVersion);
      })
      .then(mngs.setVersion)
      .then(doGit)
      .tap(function(version) {
        logger.success('Done ' + version);
      })
      .catch(function(err) {
        logger.error(err.toString ? err.toString() : err);
        return Promise.reject(err);
      })
      .nodeify(cb);
}

startProcess._incVersion = incVersion;

module.exports = startProcess;
