'use strict';

var Promise = require('bluebird'),
    git = require('gitftw'),
    managers = require('../src/managers'),
    start = require('../src/processes/start');


describe('Start version', function() {

  beforeEach(function() {
    Object.keys(git).forEach(function(command) {
      sinon.stub(git, command, function() {
        return Promise.resolve();
      });
    });
  });

  it('should increment version in package files', function() {
    var mngs = managers();
    return start('patch')
      .then(mngs.getVersion)
      .then(function (newVersion) {
        return mngs.managers.each(function(manager) {
          return manager.getVersion().then(function(version) {
            expect(version).to.be.eql(newVersion);
          });
        });
      });
  });

  it('should add, commit, and push packages files', function() {
    return start('patch').tap(function() {
      expect(git.add).to.have.been.calledWith({
        files: ['.']
      });
      expect(git.commit).to.have.been.called;
      expect(git.push).to.have.been.called;
    });
  });

  describe('version bumping', function() {
    it('should be able to start a patch', function() {
      expect(start._incVersion('patch', '1.0.0'))
          .to.be.eql('1.0.1-SNAPSHOT');
      expect(start._incVersion('patch', '1.0.1-SNAPSHOT'))
          .to.be.eql('1.0.2-SNAPSHOT');
    });

    it('should be able to start a minor', function() {
      expect(start._incVersion('minor', '1.1.9'))
          .to.be.eql('1.2.0-SNAPSHOT');
      expect(start._incVersion('minor', '1.2.2-SNAPSHOT'))
          .to.be.eql('1.3.0-SNAPSHOT');
    });

    it('should be able to start a major', function() {
      expect(start._incVersion('major', '1.1.9'))
          .to.be.eql('2.0.0-SNAPSHOT');
      expect(start._incVersion('major', '2.1.7-SNAPSHOT'))
          .to.be.eql('3.0.0-SNAPSHOT');
    });

    it('should fail when unknown start type', function() {
      expect(start._incVersion.bind(null, 'asdasdasd', '1.1.9'))
          .to.throw(/start type must be one of patch, minor, major/)
    });
  });
});
