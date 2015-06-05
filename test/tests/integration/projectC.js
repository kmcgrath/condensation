var _ = require('lodash'),
async = require('async'),
clone = require('clone'),
assert = require('assert'),
path = require('path'),
npm = require('npm'),
exec = require('child_process').exec;
fs = require('fs');

var distributionFiles = [
  'particles/cftemplates/proj.template',
  'node_modules/projectB/particles/assets/bootstrap.sh',
  'node_modules/projectB/particles/assets/download.sh',
  'node_modules/projectB/node_modules/projectA/particles/cftemplates/vpc.template'
];

describe('projectC', function(){
  var gulp;

  before(function(done) {
    var count = 0;
    var func = function() {
      count = count + 1;
      if (count === 2) {
        done();
      }
    };

    var pA = exec("npm link ../projectA",{cwd: 'test/fixtures/projectC'},function(err,stdout,stderr){
	    console.log(err,stdout,stderr);
	    func();
    });
    var pB = exec("npm link ../projectB",{cwd: 'test/fixtures/projectC'},function(err,stdout,stderr){
	    console.log(err,stdout,stderr);
	    func();
    });

  });

  beforeEach(function() {
    gulp = clone(require('gulp'));
    require('../../../').buildTasks(
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
        root: 'test/fixtures/projectC',
        taskPrefix: '',
        dist: 'test/dist/pC'
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