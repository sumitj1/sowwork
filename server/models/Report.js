const mongoose = require("mongoose");
const {
  REPORT_TYPE_POST,
  REPORT_TYPE_COMMENT,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
  STATUS_RESOLVED,
  STATUS_BLOCKED,
} = require("../config/constants");

const reportSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [REPORT_TYPE_POST, REPORT_TYPE_COMMENT],
  },
  reported_to: { type: String },
  reported_by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  status: {
    type: String,
    required: true,
    enum: [
      STATUS_ACTIVE,
      STATUS_INACTIVE,
      STATUS_DELETED,
      STATUS_PENDING,
      STATUS_RESOLVED,
      STATUS_BLOCKED,
    ],
  },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
  deleted_at: { type: Date },
});

const Report = mongoose.model("report", reportSchema);

module.exports = Report;
