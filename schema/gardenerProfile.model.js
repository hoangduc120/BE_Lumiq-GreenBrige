// models/gardenerProfile.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gardenerProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gardenPhoto: [
    {
      url: String,
      public_id: String
    }
  ],
  nationalIdPhoto: [
    {
      url: String,
      public_id: String
    }
  ],
  bankAccountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  nationalId: { type: String, required: true },
  placeAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin
});

module.exports = mongoose.model('GardenerProfile', gardenerProfileSchema);
