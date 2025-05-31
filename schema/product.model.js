// product.model.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categories: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }
],

  gardener: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plantedAt: Date,
    photos: [
    {
      url: String,
      public_id: String
    }
  ],
  description: String,
  lastInspected: Date,
  qrCode: String,
  discount: {
    type: Number,
    default: 0,
  },
  price: { type: Number, required: true },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  inspections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inspection",
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
