var _ = require('lodash'),
async = require('async'),
clone = require('clone'),
assert = require('assert'),
path = require('path'),
fs = require('fs');

var tasks = [
  'build',
  'build:0',
  'build:east',
  'clean',
  'default',
  'deploy',
  'deploy:0',
  'deploy:east',
  's3:bucket:ensure:0',
  's3:list',
  's3:objects:write:0'
];

var distributionFiles = [
  'particles/cftemplates/instance.template',
  'particles/assets/bootstrap.sh',
  'particles/assets/download.sh',
  'node_modules/projectA/particles/cftemplates/vpc.template'
];

describe('projectB', function(){
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
              bucket: '',
            },
            labels: ['east'],
            validate: false,
            create: false
          }
        ],
        projectName: 'projectB',
        root: 'test/projectB',
        taskPrefix: '',
        dist: 'test/dist/pB'
      }
    );
  });

  tasks.forEach(function(task) {
    it('should have a task named \''+task+'\'', function(done){
      assert(_.indexOf(_.keys(gulp.tasks),task)>=0);
      done();
    });
  });

  it('should build the project', function(done){
    gulp.start('build');
    gulp.on('err',assert.fail);
    gulp.on('stop',function(){
      async.each(
        distributionFiles,
        function(file,cb) {
          fs.lstat(path.join('test/dist/pB/0',file), function(err,stat) {
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
      fs.lstat('test/dist/pB', function(err, stats) {
        assert(err);
        done();
      });
    });
  });

});
