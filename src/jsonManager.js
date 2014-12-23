'use strict';

var Promise = require('bluebird'),
    fs = require('fs-extra');

/**
 * A JSON Manager
 * @param {String} path This manager file descriptor
 * @constructor
 */
module.exports = function(path) {
  return {
    /**
     * Gets the file implementation of this package managers
     * @returns {Promise} promise The file path
     */
    getFile: function getFile() {
      return Promise.resolve(path);
    },
    /**
     * Returns if the manager is available
     * @returns {Promise} promise
     */
    isAvailable: function isAvailable() {
      return Promise.method(fs.existsSync)(path);
    },
    /**
     * Updates the version property in a json file containing it
     *
     * @param {String} newVersion the new version to set
     * @returns {Promise} promise
     */
    setVersion: function setVersion(newVersion) {
      //Use this sync versions to make test compatible with fs-mock
      return Promise.method(fs.readJSONSync)(path)
          .then(function(json) {
            json.version = newVersion;
            return json;
          })
          .then(fs.writeJSONSync.bind(null, path));
    },
    /**
     * Gets the version from a JSON
     * @returns {Promise} promise Resolves with the version
     */
    getVersion: function getVersion() {
      //Use this sync versions to make test compatible with fs-mock
      return Promise.method(fs.readJSONSync)(path)
          .then(function(json) {
            return json.version;
          });
    }
  };
};
