const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
  USER_ROLE_ADMIN,
  USER_ROLE_ARTIST,
  USER_ROLE_CUSTOMER,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
  SALT_ROUNDS,
} = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone_number: { type: String, trim: true, unique: true },
    address: {
      address_line_1: { type: String },
      address_line_2: { type: String },
      landmark: { type: String },
      pincode: { type: String },
      city: { type: String },
      state: { type: String },
    },
    profile_image: { type: String, default: "avatar.png" },
    user_role: {
      type: String,
      required: true,
      enum: [USER_ROLE_ADMIN, USER_ROLE_ARTIST, USER_ROLE_CUSTOMER],
    },
    specializations: {
      category: { type: mongoose.Schema.ObjectId },
      specialization: { type: mongoose.Schema.ObjectId },
      sub_specialization: { type: mongoose.Schema.ObjectId },
    },
    status: {
      type: String,
      required: true,
      enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED, STATUS_PENDING],
    },
    password: { type: String },
    login_code: {
      code: { type: String, default: null },
      expired: { type: Boolean, default: false },
    },
    about: { type: String, trim: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

//generating hashed password
userSchema.methods.genHashedPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_ROUNDS), null);
};

const User = mongoose.model("user", userSchema);

module.exports = User;
