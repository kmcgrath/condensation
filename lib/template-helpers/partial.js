var Handlebars = require('handlebars'),
_ = require('lodash'),
fs = require('fs'),
File = require('vinyl');

var createPartialHelper = function(options) {
  var opts = _.merge({
    handlebars: Handlebars,
    projectDir: process.cwd(),
    particleLoader: null
  },_.omit(options,_.isUndefined));
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
    var particle = opts.particleLoader.loadParticle('partial',module,pPath,{parentFile: data._file});
    var file = new File({path: particle.path});
    var partialContents = fs.readFileSync(particle.path,{encoding:'utf8'});

    if (!engine.partials[particle.path]) {
      engine.registerPartial(particle.path,fs.readFileSync(particle.path,{encoding:'utf8'}));
    }

    var fn = engine.compile(partialContents);
    return new engine.SafeString(fn(_.merge(data,{_file: file})));
  };

  if (!engine.helpers.partial) {
    engine.registerHelper('partial',helper);
  }
  return helper;
};

module.exports = createPartialHelper;
