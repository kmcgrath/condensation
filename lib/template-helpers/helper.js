var Handlebars = require('handlebars'),
_ = require('lodash');

var createHelper = function(options) {
  options = _.merge({
    handlebars: Handlebars,
    projectDir: process.cwd(),
    particleLoader: null
  },options);
  var engine = options.handlebars;

  var helper = function () {
    var self = this;
    var module, pPath;

    var moduleCheck = arguments[0].split(':');
    if (moduleCheck[0] === 'module') {
      module = moduleCheck[1];
      pPath = arguments[1];
    }
    else {
      module = '';
      pPath = arguments[0];
    }

    var context = arguments[arguments.length-1];

    var data = Handlebars.createFrame(context.data.root);
    var particle = options.particleLoader.loadParticle('helper',module,pPath,{parentFile: data._file});

    var helperFunc = require(particle.path);

    var moduleHelperArgs = _.slice(arguments,(module ? 2 : 1),arguments.length-1);
    return helperFunc.apply(self,moduleHelperArgs);
  };

  if(!engine.helpers.helper) {
    engine.registerHelper('helper',helper);
  }

  return helper;
};

module.exports = createHelper;
