const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
} = require("../config/constants");

const bookmarkSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  status: {
    type: String,
    required: true,
    enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED, STATUS_PENDING],
  },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
  deleted_at: { type: Date },
});

const Bookmark = mongoose.model("bookmark", bookmarkSchema);

module.exports = Bookmark;
