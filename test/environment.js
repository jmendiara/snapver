'use strict';

var sinon = require ('sinon'),
    chai = require ('chai'),
    fsMock = require('mock-fs'),
    sinonChai = require('sinon-chai'),
    config = require('../src/config');

chai.use(sinonChai);

global.expect = chai.expect;
global.should = chai.should();

beforeEach(function(){
  global.sinon = sinon.sandbox.create();
});

afterEach(function(){
  global.sinon.restore();
});

beforeEach(function() {
  fsMock({
    'bower.json': JSON.stringify({version: '1.0.0'}),
    'package.json': JSON.stringify({version: '1.0.0'}),
    'component.json': JSON.stringify({version: '1.0.0'})
  });
});

afterEach(function(){
  fsMock.restore();
});

config.set('verbose', false);
