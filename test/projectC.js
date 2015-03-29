var _ = require('lodash'),
async = require('async'),
clone = require('clone'),
assert = require('assert'),
path = require('path'),
fs = require('fs');

var distributionFiles = [
  'particles/cftemplates/proj.template',
  'node_modules/projectB/particles/assets/bootstrap.sh',
  'node_modules/projectB/particles/assets/download.sh',
  'node_modules/projectB/node_modules/projectA/particles/cftemplates/vpc.template'
];

describe('projectC', function(){
  var gulp;

  beforeEach(function() {
    gulp = clone(require('gulp'));
    require('../').buildTasks(
      gulp,
      {
        s3: [
          {
            aws: {
              region: 'us-east-1',
              bucket: 'my-test-bucket',
            },
            labels: ['east'],
            validate: false,
            create: false
          }
        ],
        projectName: 'projectC',
        root: 'test/projectC',
        taskPrefix: '',
        dist: 'test/dist/pC',
        dependencySrc: [
          'test/projectC/fake_bower_components'
        ],
      }
    );
  });

  it('should build the project', function(done){
    gulp.start('build');
    gulp.on('err',assert.fail);
    gulp.on('stop',function(){
      async.each(
        distributionFiles,
        function(file,cb) {
          fs.lstat(path.join('test/dist/pC/0',file), function(err,stat) {
            assert(!err);
            cb();
          });
        },
        done
      );
    });
  });

  it('should clean the project', function(done){
    gulp.start('clean');
    gulp.on('stop',function(){
      fs.lstat('test/dist/pC', function(err, stats) {
        assert(err);
        done();
      });
    });
  });
});
