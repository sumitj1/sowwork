const { STATUS_ACTIVE } = require("../../config/constants");
const Notification = require("../../models/Notifications");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
/**
 * Get All Notifications
 * TYPE : GET
 * Route : /customer/notification
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req?.user?._id;
    const notifications = await Notification.find({
      status: STATUS_ACTIVE,
      user: userId,
    }).sort("created_at : -1");

    res.send({ error: false, data: notifications });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
