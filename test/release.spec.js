'use strict';

var Promise = require('bluebird'),
    git = require('gitftw'),
    managers = require('../src/managers'),
    release = require('../src/processes/release');

describe('End version', function() {

  beforeEach(function() {
    Object.keys(git).forEach(function(command) {
      switch (command) {
        case 'isClean':
          sinon.stub(git, command, function() {
            return Promise.resolve(true);
          });
          break;
        case 'getCurrentBranch':
          sinon.stub(git, command, function() {
            return Promise.resolve('develop');
          });
          break;
        case 'getTags':
          sinon.stub(git, command, function() {
            return Promise.resolve([]);
          });
          break;
        default:
          sinon.stub(git, command, function() {
            return Promise.resolve();
          });
      }
    });
  });

  it('should increment version in package files', function() {
    var mngs = managers();
    return release()
      .then(mngs.getVersion)
      .then(function (newVersion) {
        return mngs.managers.each(function(manager) {
          return manager.getVersion().then(function(version) {
            expect(version).to.be.eql(newVersion);
          });
        });
      });
  });


  describe('version bumping', function() {
    it('should be able to end a developing version', function() {
      expect(release._incVersion('1.0.0-SNAPSHOT'))
          .to.be.eql('1.0.0');
    });

    it('should be able to end an standard version', function() {
      expect(release._incVersion('1.0.0'))
          .to.be.eql('1.0.1');
    });

  });
});
