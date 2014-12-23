'use strict';

var Promise = require('bluebird'),
    fsMock = require('mock-fs'),
    managers = require('../src/managers');

describe('Managers', function() {
  it('should get the version of all managers', function() {
    return managers().getVersion()
        .tap(function(version) {
          expect(version).to.be.eql('1.0.0');
        });
  });

  it('should fail when the managers versions differ', function() {
    fsMock({
      'bower.json': JSON.stringify({version: '1.0.0'}),
      'package.json': JSON.stringify({version: '2.0.0'})
    });
    return managers().getVersion()
        .then(Promise.reject)
        .catch(function(err) {
          expect(err).to.match(/Packages version mismatch/);
        });
  });

  it('should get all managers files', function() {
    return managers().getFiles()
        .tap(function(files) {
          expect(files).to.be.eql([
              'bower.json',
              'package.json',
              'component.json'
          ]);
        })
  });

  it('should update all managers version', function() {
    var mng = managers();
    return mng.setVersion('2.0.0')
        .then(function() {
          return mng.getVersion().tap(function(version) {
            expect(version).to.be.eql('2.0.0');
          });
        });
  });

});