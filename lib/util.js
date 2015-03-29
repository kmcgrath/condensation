var _ = require('lodash'),
path = require('path');

exports.genTaskNameFunc = function(options) {
  options = _.merge({
    separator: ':'
  },options);

  var genTaskNameFunc = function() {
    var validParts = _.dropWhile(_.flatten([this.prefix,arguments]),function(item) {
      return !item;
    });
    return validParts.join(this.separator);
  };

  return genTaskNameFunc.bind(options);
};

exports.genDistPathFunc = function(options) {
  options = _.merge({
    root: 'dist',
    s3prefix: '',
    id: null
  },options);

  var func = function() {
    return(
      path.join.apply(
        null,
        _.flatten([
          this.root,
          this.id,
          this.s3prefix
        ])
      )
    );
  };

  return func.bind(options);
};
