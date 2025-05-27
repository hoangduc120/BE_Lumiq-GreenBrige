const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var reviewSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Export the model
module.exports = mongoose.model("Review", reviewSchema);
