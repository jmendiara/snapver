'use strict';

var config = require('./config'),
    start = require('./processes/start'),
    release = require('./processes/release');

/**
 * The API factory for snapver
 *
 * @param {Object} conf Configuration to use, overring all the defaults ones
 * @returns {Object} The API
 */
module.exports = function snapver(conf) {

  config.load(conf || {}).validate();

  return {
    /**
     * Starts a new snapshot version
     * @param {String} type The type of new developing release.
     *   One of [patch, minor, major]
     * @param {callback} [cb] The execution callback
     * @returns {Promise} [promise] The execution promise
     */
    start: start,
    /**
     * Releases current snapshot version
     * @param {callback} [cb] The execution callback
     * @returns {Promise} [promise] The execution promise
     */
    release: release
  };
};
