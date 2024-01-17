const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
  PACKAGE_TYPE_BASIC,
  PACKAGE_TYPE_CUSTOM,
  PACKAGE_TYPE_PREMIUM,
  PACKAGE_TYPE_STANDARD,
} = require("../config/constants");

const packageSchema = new mongoose.Schema(
  {
    price: { type: String, required: true },
    details: [
      {
        type: String,
        trim: true,
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED],
      default: STATUS_ACTIVE,
    },
    type: {
      type: String,
      required: true,
      enum: [
        PACKAGE_TYPE_BASIC,
        PACKAGE_TYPE_CUSTOM,
        PACKAGE_TYPE_PREMIUM,
        PACKAGE_TYPE_STANDARD,
      ],
      default: PACKAGE_TYPE_BASIC,
    },
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

const Package = mongoose.model("package", packageSchema);

module.exports = Package;
