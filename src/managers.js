'use strict';
var Promise = require('bluebird'),
    JSONManager = require('./jsonManager');

/**
 * The Managers factory
 *
 * @constructor
 */
var Managers = function() {
  //TODO: Allow paths by config
  var managers = Promise.resolve([
        new JSONManager('bower.json'),
        new JSONManager('package.json'),
        new JSONManager('component.json')
      ])
      .filter(function(manager) {
        return manager.isAvailable();
      });

  return {
    /**
     * The available managers
     *
     * @type {Promise} The promise for all available managers
     */
    managers: managers,
    /**
     * Returns all the description files for all available managers
     *
     * @returns {Promise} promise
     */
    getFiles: function getFiles() {
      return managers.map(function(manager) {
        return manager.getFile();
      });
    },
    /**
     * Sets a new version in all available managers
     *
     * @param {String} newVersion The new version to set
     * @returns {Promise} promise The new version set
     */
    setVersion: function setVersion(newVersion) {
      return managers
          .each(function(manager) {
            return manager.setVersion(newVersion);
          })
          .return(newVersion);
    },
    /**
     * Gets the version set for all managers
     *
     * @returns {Promise} promise
     */
    getVersion: function getVersion() {
      return managers
        .map(function(manager) {
          return manager.getVersion();
        })
        .reduce(function(memo, version) {
          if (memo && memo !== version) {
            throw new Error('Packages version mismatch')
          }
          return version;
        });
    }
  };
};

module.exports = Managers;
