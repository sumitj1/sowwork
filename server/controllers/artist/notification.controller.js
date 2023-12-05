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
