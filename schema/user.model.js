const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  googleId: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    required: true,
  },
  yob: {
    type: Date,
    default: null,
  },

  role: {
    type: String,
    enum: ["user", "admin", "gardener"],
    default: "user",
  },

  refreshToken: {
    type: String,
    default: null,
  },

  fullName: {
    type: String,
    default: null,
  },
  nickName: {
    type: String,
    default: null,
  },

  phone: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;