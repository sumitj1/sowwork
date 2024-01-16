const User = require("../../models/User");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
/**
 * GET My Profile
 * Type : GET
 * Route : /dashboard/get-my-profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    let user = await User.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
    ]);
    console.log("🚀 ~ exports.getMyProfile= ~ user:", user);
    res.send({ error: false, data: user });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
