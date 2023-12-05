const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
} = require("../config/constants");

const notificationSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  body: {
    type: String,
    trim: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  status: {
    type: String,
    required: true,
    enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED, STATUS_PENDING],
    default: STATUS_ACTIVE,
  },
  is_read: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
  deleted_at: { type: Date },
});

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;
