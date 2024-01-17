const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
} = require("../config/constants");

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: true },
    rating: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED],
      default: STATUS_ACTIVE,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
