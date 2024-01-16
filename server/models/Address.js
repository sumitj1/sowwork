const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
} = require("../config/constants");

const addressSchema = new mongoose.Schema(
  {
    coordinates: {
      lat: String,
      lng: String,
    },
    address: { type: String, required: true },
    building_number: { type: String, required: true },
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: {
      type: String,
      required: true,
      enum: [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_DELETED],
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

const Address = mongoose.model("address", addressSchema);

module.exports = Address;
