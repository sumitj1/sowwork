const { STATUS_ACTIVE, STATUS_INACTIVE } = require("../../config/constants");
const User = require("../../models/User");

/**
 * Get Users By Role
 * Type : GET
 * Route : /user/:role
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.aggregate([
      {
        $match: {
          $and: [
            { status: { $in: [STATUS_ACTIVE, STATUS_INACTIVE] } },
            { user_role: role.toUpperCase() },
          ],
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "user",
          as: "address",
        },
      },
    ]);
    res.send({ error: false, data: users });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
