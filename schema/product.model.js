const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    author: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    reviews: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Review',
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 10,
    },
});

//Export the model
module.exports = mongoose.model('Product', productSchema);