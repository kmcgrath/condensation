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
    options.particleLoader.loadParticle('asset',module,pPath,{parentFile: data._file});

    return '';
  };

  if (!engine.helpers.requireAssets) {
    engine.registerHelper('requireAssets',helper);
  }
  return helper;
};

module.exports = createHelper;
