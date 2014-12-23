# snapver - Snapshot your code

[![npm version](https://badge.fury.io/js/snapver.svg)](http://badge.fury.io/js/snapver)
[![Build Status](https://travis-ci.org/jmendiara/snapver.svg)](https://travis-ci.org/jmendiara/snapver)
[![Coverage Status](https://img.shields.io/coveralls/jmendiara/snapver.svg)](https://coveralls.io/r/jmendiara/snapver)
[![Dependency Status](https://david-dm.org/jmendiara/snapver.png)](https://david-dm.org/jmendiara/snapver)
[![devDependency Status](https://david-dm.org/jmendiara/snapver/dev-status.svg)](https://david-dm.org/jmendiara/snapver#info=devDependencies)

Introducing the snapshot project lifecycle managing for easy preintegrations and canary channels

## Installation
```sh
npm install -g snapver
```

## Usage
Start a patch version. Can be `patch`, `minor`, `major`
```sh
$ snapver start patch
```

Make a release in git
```sh
$ snapver release
```

Help please!
```sh
$ snapver --help
```

## API
```js
var snapver = require('snapver');

snapver({
  branch: 'release' //give additional config
}).start('patch', function(err, version) {
  console.log('New Version %s started', version);
});

//Dual API, node callbacks and promises
//It will use `.snaprc` [commented] json file in your working directory 
snapver().release().then(function(version) {
  console.log('Version %s released', version);
});
```
