'use strict';

var Promise = require('bluebird'),
    config = require('../config'),
    semver = require('semver'),
    managers = require('../managers'),
    logger = require('../logger'),
    git = require('gitftw');

/**
 * Increment a patch version. It will remove SNAPSHOT if
 * it's present in the version number
 *
 * @private
 * @param {String} version The current version
 * @returns {String} version The new Version
 */
function incVersion(version) {
  version = semver.inc(version, 'patch');
  logger.info('Bumping to ' + version);
  return version;
}

/**
 * Check if the git workspace is clean
 *
 * @private
 * @returns {Promise} promise Resolves with true when clean. Rejects otherwise
 */
function isClean() {
  return git.isClean()
  .then(function(isClean) {
    if (!isClean) {
      return Promise.reject(new Error('Your current workspace is not clean. ' +
          'Commit, stash or reset before releasing'));
    }
  });
}

/**
 * Creates transaction for using a temporary branch, created from the current one.
 * For using with Promise.using
 * Once the work with the work is done, the temp branch is deleted
 * and the git checkouts the original branch
 *
 * @private
 * @param {String} type of the branch. It's a convenient reading helper
 * @returns {Promise} promise Resolves with the new branch name
 */
function createTempBranch(type) {
  var branchName = 'snapver-' + type + '-' + Date.now(),
      initialBranch;

  return git.getCurrentBranch()
  .then(function(currentBranch) {
    initialBranch = currentBranch;
  })
  .then(function() {
    return git.checkout({
      branch: branchName,
      create: true
    })
    .return(branchName);
  })
  .disposer(function() {
    return git.checkout({
      branch: initialBranch
    }).then(function() {
      return git.removeLocalBranch({
        branch: branchName,
        force: true
      });
    });
  });
}

/**
 * Creates a transaction for ensuring after the work is done, the original branch
 * is restored
 *
 * @returns {Promise} promise Resolves with the current branch name
 */
function ensureCurrentBranch() {
  return git.getCurrentBranch()
      .disposer(function(currentBranch) {
        return git.checkout({
          branch: currentBranch
        });
      });
}

/**
 * Set up the git environment for making releases
 *
 * @returns {Promise} promise Resolves with the current branch
 */
function setUp() {
  return Promise.using(ensureCurrentBranch(), function(currentBranch) {
    return git.fetch({
          remote: config.get('remote')
        })
        .then(function() {
          return git.fetch({
            remote: config.get('remote'),
            tags: true
          });
        })
        .then(function() {
          return git.pull({
            remote: config.get('remote'),
            branch: currentBranch
          });
        })
        .then(function() {
          return git.checkout({
            branch: config.get('branch')
          });
        })
        .then(function() {
          return git.pull({
            remote: config.get('remote'),
            branch: config.get('branch')
          });
        })
        .return(currentBranch);
  });
}

/**
 * Commits the new version to the current branch
 *
 * @param {String} newVersion the new Version
 * @returns {Promise} promise resolves with the version
 */
function commitVersion(newVersion) {
  return git.add({
        files: ['.']
      })
      .then(function() {
        return git.commit({
          message: 'Bump version ' + newVersion
        });
      })
      .return(newVersion);
}

/**
 * Checks a tag for this version does not exist
 *
 * @param {String} newVersion the new Version
 * @returns {Promise} promise resolves with the version
 */
function checkVersionDoesNotExist(newVersion) {
  return git.getTags()
      .then(function(tags) {
        if (tags.indexOf(newVersion) !== -1) {
          return Promise.reject(new Error('Version tag ' + newVersion + ' already exists'));
        }
      })
      .return(newVersion);
}

/**
 * Bumps a release to Git, to development branch and release branch,
 * in local and remote
 *
 * @param {String} developmentBranch the development branch name
 * @param {String} workBranch the branch that has the version bumped
 * @param {String} newVersion The new version
 * @returns {Promise} promise
 */
function bumpRelease(developmentBranch, workBranch, newVersion) {
  return bumpToReleaseBranch(config.get('branch'), workBranch, newVersion)
      .then(function() {
        return bumpToDevelopmentBranch(developmentBranch, workBranch, newVersion);
      });
}

/**
 * Bumps the version to git
 *
 * @param {String} developmentBranch The current development branch
 * @returns {Promise} promise resolves with the new Version
 */
function bumpVersion(developmentBranch) {
  //TODO: create temp var once the tag does not exists
  return Promise.using(createTempBranch('work'), function(workBranch) {
      var mngs = managers();
      return mngs.getVersion()
          .then(incVersion)
          .then(checkVersionDoesNotExist)
          .then(mngs.setVersion)
          .then(commitVersion)
          .then(function(newVersion) {
            return bumpRelease(developmentBranch, workBranch, newVersion)
                .return(newVersion);
          });
    });
}

/**
 * A convenient method to implement a kind of continuous integration
 * At this point, the workspace contains a temporary merge from release and develop
 * and we could lint, test, and make this kind of things
 *
 * @returns {Promise}
 */
function checkValidity() {
  return Promise.resolve();
}

/**
 * Merges the workbranch (with the commit with the bump version) in the current one
 *
 * @param {String} workBranch the workbranch
 * @param {String} version the new version
 * @returns {Promise} promise
 */
function commitToDevelopmentBranch(workBranch, version) {
  return git.merge({
    branch: workBranch,
    message: 'Bump version ' + version //TODO: configurable
  });
}

/**
 * Push the current branch to the remote development
 * @param {String} developmentBranch the development branch
 * @returns {Promise} promise
 */
function pushDevelopmentBranch(developmentBranch) {
  return git.push({
    remote: config.get('remote'),
    branch: developmentBranch
  });
}

/**
 * Bumps a version to the development branch
 *
 * @param {String} developmentBranch
 * @param {String} workBranch
 * @param {String} newVersion
 * @returns {Promise}
 */
function bumpToDevelopmentBranch(developmentBranch, workBranch, newVersion) {
  return Promise.using(ensureCurrentBranch(), function() {
    return git.checkout({
      branch: developmentBranch
    })
    .then(function() {
      return commitToDevelopmentBranch(workBranch, newVersion);
    })
    .then(function() {
      return pushDevelopmentBranch(developmentBranch);
    });
  });
}

/**
 * Test if the merge succeeds before doing it
 *
 * @param {String} workBranch
 * @returns {Promise}
 */
function testMergeInRelease(workBranch) {
  return Promise.using(createTempBranch('merge'), function() {
    return git.merge({
      branch: workBranch,
      message: 'Test release'
    })
    .then(checkValidity);
  });
}

/**
 * Commits and tags the release
 * @param {String} workBranch
 * @param {String} newVersion
 * @returns {*}
 */
function commitToReleaseBranch(workBranch, newVersion) {
  return git.merge({
    branch: workBranch,
    noFF: true,
    message: 'Release ' + newVersion   //TODO
  })
  .then(function() {
    //tag the release
    return git.tag({
      tag: newVersion,
      annotated: true,
      message: newVersion
    });
  });
}

/**
 * Push the release to remote
 * @param {String} releaseBranch
 * @param {String} newVersion
 * @returns {Promise}
 */
function pushReleaseBranch(releaseBranch, newVersion) {
  return git.push({
    remote: config.get('remote'),
    branch: releaseBranch
  })
  .then(function() {
    //push the tag
    return git.push({
      remote: config.get('remote'),
      tag: newVersion
    });
  });
}

/**
 * Bumps to the release branch
 * @param {String} releaseBranch
 * @param {String} workBranch
 * @param {String} newVersion
 * @returns {Promise}
 */
function bumpToReleaseBranch(releaseBranch, workBranch, newVersion) {
  return Promise.using(ensureCurrentBranch(), function() {
    return git.checkout({
      branch: releaseBranch
    })
    .then(function() {
      return testMergeInRelease(workBranch);
    })
    .then(function() {
      return commitToReleaseBranch(workBranch, newVersion);
    })
    .then(function() {
      return pushReleaseBranch(releaseBranch, newVersion);
    });
  });
}

/**
 * Ends current version, bumping version and pushing to remote
 *
 * @param {callback} [cb] The execution callback
 * @returns {Promise} [promise] The execution promise
 */
function releaseProcess(cb) {
  return isClean()
  .then(setUp)
  .then(bumpVersion)
  .tap(function(newVersion) {
    logger.success('Done ' + newVersion);
  })
  .catch(function(err) {
    logger.error(err.toString ? err.toString() : err);
    return Promise.reject(err);
  })
  .nodeify(cb);
}

releaseProcess._incVersion = incVersion;

module.exports = releaseProcess;
