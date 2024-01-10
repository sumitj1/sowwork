const User = require("../../models/User");

/**
 *  Profile : Basic Info
 * Type : POST
 * Route : /artist/profile/basic-info
 */
exports.saveBasicInfo = async (req, res) => {
  try {
    const { _id } = req.user;
    const { email, first_name, last_name } = req.body;

    //checking is email is already used
    let user = await User.findOne({ email, _id: { $ne: _id } });

    if (user) throw new Error("Email already in use.");

    User.findByIdAndUpdate(_id, {
      $set: {
        email,
        first_name,
        last_name,
      },
    }).then(() => {
      res.send({ error: false, message: "User updated" });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Profile : Address
 * Type : POST
 * Route : /artist/profile/address-info
 */
exports.saveAddressInfo = async (req, res) => {
  try {
    const { _id } = req.user;
    const { address_line_1, address_line_2, landmark, pincode, city, state } =
      req.body;

    User.findByIdAndUpdate(_id, {
      $set: {
        address: {
          address_line_1,
          address_line_2,
          landmark,
          pincode,
          city,
          state,
        },
      },
    }).then(() => {
      res.send({ error: false, message: "Address updated" });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
