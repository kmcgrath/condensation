var assert = require('assert'),
clone = require('clone'),
fs = require('fs'),
npm = require('npm'),
exec = require('child_process').exec,
_ = require('lodash');

var config = {
  s3: [
    {
      aws: {
        region: 'us-east-1',
        bucket: '',
      },
      validate: false,
      create: false,
      prefix: 'testing-path'
    }
  ],
  projectName: 'projectB-config2',
  root: 'test/fixtures/projectB',
  taskPrefix: '',
  dist: 'test/dist/pB-2'
};

describe('projectB-config2', function(){
  var gulp;

  before(function(done) {
    var pA = exec("npm link ../projectA",{cwd: 'test/fixtures/projectB'},function(err,stdout,stderr){
	    console.log(err,stdout,stderr);
	    done();
    });
    //pA.on('exit',function(err){console.log(err); done(err);});
  });

  beforeEach(function(done) {
    gulp = clone(require('gulp'));
    require('../../../').buildTasks(gulp,config);
    gulp.start('build');
    gulp.on('stop',function(){done()});
  });

  afterEach(function(done) {
    var afterGulp = clone(require('gulp'));
    require('../../../').buildTasks(afterGulp,config);
    afterGulp.start('clean');
    afterGulp.on('stop',function(){done()});
  });

  it("should prefix all file paths with 'testing-path' for the distribution", function(done){
      fs.lstat('test/dist/pB-2/0/testing-path', function(err, stats) {
        assert((!err && stats.isDirectory()));
        done();
      });
  });

});