var Handlebars = require('handlebars'),
_ = require('lodash');

var createHelper = function(options) {
  var opts = _.merge({
    handlebars: Handlebars,
    projectDir: process.cwd(),
    particleLoader: null
  },options);
  var engine = opts.handlebars;

  var helper = function () {
    var module, pPath, context;

    var moduleCheck = arguments[0].split(':');
    if (moduleCheck[0] === 'module') {
      module = moduleCheck[1];
      pPath = arguments[1];
      context = arguments[2];
    }
    else {
      module = '';
      pPath = arguments[0];
      context = arguments[1];
    }

    var data = Handlebars.createFrame(context.data.root);
    var particle = opts.particleLoader.loadParticle('template',module,pPath,{parentFile: data._file});

    return data.s3.awsPath+'/'+particle.relative;
  };

  if (!engine.helpers.templateS3Url) {
    engine.registerHelper('templateS3Url',helper);
  }
  return helper;
};

module.exports = createHelper;
