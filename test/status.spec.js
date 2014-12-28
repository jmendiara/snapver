'use strict';

var Promise = require('bluebird'),
    git = require('gitftw'),
    managers = require('../src/managers'),
    status = require('../src/processes/status');


describe('Current', function() {

  beforeEach(function() {
    Object.keys(git).forEach(function(command) {
      sinon.stub(git, command, function() {
        return Promise.resolve();
      });
    });
  });

  it('should give the current version', function() {
    return status()
      .then(function (version) {
        expect(version.current).to.be.eql('1.0.0');
      });
  });

});
