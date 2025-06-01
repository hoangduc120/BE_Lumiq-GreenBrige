const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  name: String,
  shortName: String,
  bin: String,
  code: String,
}, { timestamps: true });

module.exports = mongoose.model('Bank', bankSchema);
