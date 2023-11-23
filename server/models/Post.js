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

const postSchema = new mongoose.Schema({
  image: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
  status: {
    type: String,
    required: true,
    enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED, STATUS_PENDING],
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  comments: [commentSchema],

  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
  deleted_at: { type: Date },
});

const Post = mongoose.model("post", postSchema);

module.exports = Post;
