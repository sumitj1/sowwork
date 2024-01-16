const { STATUS_ACTIVE } = require("../../config/constants");
const Notification = require("../../models/Notifications");

exports.addNotification = async (req, res) => {
  try {
    const { title, body, id } = req.body;
    const userId = req?.user?._id || id;

    let newNotification = new Notification({
      title,
      body,
      user: userId,
    });

    await newNotification.save();

    res.send({ error: false, message: "Notification added." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get All Notifications
 * TYPE : GET
 * Route : /artist/notification
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const { _id } = req.user;

    const notifications = await Notification.find({
      status: STATUS_ACTIVE,
      user: _id,
    }).sort("created_at : -1");

    res.send({ error: false, data: notifications });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
