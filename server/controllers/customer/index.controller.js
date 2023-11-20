const {
  USER_ROLE_CUSTOMER,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
  JWT_SECRET,
  STATUS_ACTIVE,
} = require("../../config/constants");
const User = require("../../models/User");
const Address = require("../../models/Address");
const { otpGen } = require("otp-gen-agent");
const jwt = require("jsonwebtoken");

/**
 * Customer Login : loginStep1 : send OTP
 * Type : POST
 * Route : /customer/login/send-code
 */
exports.loginStep1 = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const code = await otpGen();

    const user = await User.findOne({
      phone_number,
      user_role: USER_ROLE_CUSTOMER,
    });
    //if phone number is not in the DB,
    //creating a temp user
    if (!user) {
      let newTempUser = new User({
        first_name: "User",
        phone_number: phone_number,
        user_role: USER_ROLE_CUSTOMER,
        status: STATUS_PENDING,
      });

      let newUser = await newTempUser.save();

      //updating code on user
      User.findByIdAndUpdate(newUser.id, {
        $set: {
          "login_code.code": code,
        },
      })
        .then(() => {
          return res.send({ error: false, code });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } else {
      //if phone number if found
      if (user.status == STATUS_INACTIVE)
        throw new Error("Account is inactive, please contact admin.");

      if (user.status == STATUS_DELETED)
        throw new Error("Account is deleted, please contact admin.");

      //updating code on user
      User.findByIdAndUpdate(user.id, {
        $set: {
          "login_code.code": code,
          "login_code.expired": false,
        },
      })
        .then(() => {
          return res.send({ error: false, code });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    }
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Customer Login : loginStep2 : verify OTP
 * Type : POST
 * Route : /customer/login/verify-code
 */
exports.loginStep2 = async (req, res) => {
  try {
    const { phone_number, code } = req.body;
    const user = await User.findOne({
      phone_number,
      "login_code.code": code,
      "login_code.expired": false,
    });

    if (!user) throw new Error("Code is expired or invalid.");

    if (user.status == STATUS_INACTIVE)
      throw new Error("Account is inactive, please contact admin.");

    if (user.status == STATUS_DELETED)
      throw new Error("Account is deleted, please contact admin.");

    //turning code expiry to true
    let updateObj = {
      "login_code.expired": true,
      updated_at: new Date().toISOString(),
    };

    //if user login first time, changing status to active
    if (user.status == STATUS_PENDING) updateObj.status = STATUS_ACTIVE;

    //update user status to active
    User.findByIdAndUpdate(user.id, {
      $set: updateObj,
    }).catch((error) => {
      throw new Error(error.message);
    });

    //token generation
    const token = jwt.sign(
      { _id: user._id, user_role: user.user_role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    let data = {
      _id: user._id,
      token: token,
    };
    res.send({ error: false, user: data, message: "Sign in successfully" });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Customer Profile
 * TYPE : GET
 * Route : /customer/my-profile
 */
exports.getProfileDetails = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-login_code");
    res.send({ error: false, data: user });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Update Customer Profile
 * TYPE : POST
 * Route : /customer/update-profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const { profile_image, first_name, last_name, email, address } = req.body;

    //checking if email already exists with another user
    const emailExists = await User.findOne({ _id: { $ne: _id }, email: email });
    if (emailExists) throw new Error("Email already used by another account.");

    await User.findByIdAndUpdate(_id, {
      $set: {
        profile_image,
        first_name,
        last_name,
        email,
        address,
        updated_at: new Date().toISOString(),
      },
    });

    res.send({ error: false, message: "Profile updated successfully." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Add Address
 * TYPE : POST
 * Route : /customer/my-profile/address
 */
exports.addAddress = async (req, res) => {
  try {
    const { coordinates, address, building_number, name } = req.body;
    const { _id } = req.user;

    let newAddress = new Address({
      coordinates,
      address,
      building_number,
      name,
      user: _id,
      status: STATUS_ACTIVE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    newAddress = await newAddress.save();
    res.send({ error: false, message: "Address saved", data: newAddress });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Address
 * TYPE : GET
 * Route : /customer/my-profile/address
 */
exports.getAddress = async (req, res) => {
  try {
    const { _id } = req.user;

    const address = await Address.find({
      status: STATUS_ACTIVE,
      user: _id,
    }).sort("created_at : -1");

    res.send({ error: false, data: address });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Address By ID
 * TYPE : GET
 * Route : /customer/my-profile/address/:id  :: Address Id
 */
exports.getAddressById = async (req, res) => {
  try {
    const { _id } = req.params;
    const address = await Address.findById(_id);

    res.send({ error: false, data: address });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Update Address
 * TYPE : POST
 * Route : /customer/my-profile/address/update
 */
exports.updateAddress = async (req, res) => {
  try {
    const { coordinates, address, building_number, name, _id } = req.body;

    const updatedAddress = await Address.findByIdAndUpdate(_id, {
      $set: {
        coordinates,
        address,
        building_number,
        name,
        updated_at: new Date().toISOString(),
      },
    });

    if (!updatedAddress) throw new Error("Address not found.");
    res.send({ error: false, message: "Address updated successfully." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
