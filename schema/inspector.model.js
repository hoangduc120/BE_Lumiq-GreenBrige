// inspection.model.js
const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
  notes: String,
  health: {
    type: String,
    enum: ["healthy", "unhealthy", "diseased", "dead"],
    default: "healthy",
  },
  growthStage: {
    type: String,
    enum: ["seedling", "vegetative", "flowering", "harvest"],
    default: "seedling",
  },
  fertilizerUsed: String,
  waterUsed: String,
  pesticideUsed: String,
  pruningStatus: {
    type: String,
    enum: ["not pruned", "pruned", "needs pruning"],
    default: "not pruned",
  },
});

module.exports = mongoose.model("Inspection", inspectionSchema);
