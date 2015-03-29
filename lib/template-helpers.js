module.exports = function(options) {
  return {
    assetS3Url: require('./template-helpers/assetS3Url')(options),
    helper: require('./template-helpers/helper')(options),
    partial: require('./template-helpers/partial')(options),
    requireAssets: require('./template-helpers/requireAssets')(options),
    templateS3Url: require('./template-helpers/templateS3Url')(options)
  };
};

