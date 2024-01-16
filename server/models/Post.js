const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
} = require("../config/constants");

//comment schema
const commentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
  deleted_at: { type: Date },
});

const postSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED, STATUS_PENDING],
      default: STATUS_ACTIVE,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    caption: { type: String, trim: true },
    comments: [commentSchema],
    reactions: {
      love: [String],
      happy: [String],
      surprise: [String],
      laugh: [String],
    },
    is_deleted: { type: Boolean, default: false },
    post_on_portfolio: { type: Boolean, default: false },
    post_on_feed: { type: Boolean, default: true },
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Post = mongoose.model("post", postSchema);

module.exports = Post;
