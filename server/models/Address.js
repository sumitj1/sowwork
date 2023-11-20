const mongoose = require("mongoose");
const {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DELETED,
} = require("../config/constants");

const addressSchema = new mongoose.Schema({
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
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
  deleted_at: { type: Date },
});

const Address = mongoose.model("address", addressSchema);

module.exports = Address;
