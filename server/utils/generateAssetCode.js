const Asset = require('../models/Asset');

// Produce the next sequential asset code, e.g. AST-0001.
// Based on the highest existing numeric suffix so codes don't collide
// after deletions.
const generateAssetCode = async () => {
  const last = await Asset.findOne({ assetCode: /^AST-\d+$/ })
    .sort({ assetCode: -1 })
    .select('assetCode')
    .lean();

  let next = 1;
  if (last && last.assetCode) {
    next = parseInt(last.assetCode.split('-')[1], 10) + 1;
  }
  return `AST-${String(next).padStart(4, '0')}`;
};

module.exports = generateAssetCode;
