var convict = require('convict');

var conf = convict({
  branch: {
    doc: 'The branch to put the releases',
    format: String,
    default: 'master',
    env: 'SNAPVER_BRANCH',
    arg: 'branch'
  },
  remote: {
    doc: 'The remote name',
    format: String,
    default: 'origin',
    env: 'SNAPVER_REMOTE',
    arg: 'remote'
  },
  suffix: {
    doc: 'The snapshot suffix to be appended to the version number',
    format: String,
    default: 'SNAPSHOT',
    env: 'SNAPVER_SUFFIX',
    arg: 'suffix'
  },
  verbose: {
    doc: 'Write logs to stdout',
    format: Boolean,
    default: false,
    env: 'SNAPVER_VERBOSE',
    arg: 'verbose'
  }
});

try {
  conf.loadFile('.snaprc');
} catch (err) {}

module.exports = conf;
