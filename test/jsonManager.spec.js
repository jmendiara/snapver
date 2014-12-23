var fs = require('fs'),
    fsMock = require('mock-fs'),
    JSONManager = require('../src/jsonManager');

describe('JSONManager', function() {
  var manager;
  beforeEach(function() {
    fsMock({
      './dummy.json': JSON.stringify({version: '1.0.0'})
    });
    manager = new JSONManager('./dummy.json');
  });

  it('should be able to read the version', function() {
    return manager.getVersion()
        .tap(function(version) {
          expect(version).to.be.eql('1.0.0');
        });
  });

  it('should be able to write the version', function() {
    return manager.setVersion('2.0.0')
        .then(function() {
          var data = JSON.parse(fs.readFileSync('./dummy.json').toString());
          expect(data).to.have.property('version', '2.0.0');
        });
  });

  it('should tell if it is available', function() {
    return manager.isAvailable()
        .then(function(data) {
          expect(data).to.be.eql(true)
        });
  });
});
