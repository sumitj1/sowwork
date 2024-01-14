const {
  USER_ROLE_CUSTOMER,
  STATUS_INACTIVE,
  STATUS_DELETED,
  STATUS_PENDING,
  JWT_SECRET,
  STATUS_ACTIVE,
  USER_ROLE_ARTIST,
} = require("../../config/constants");
const User = require("../../models/User");
const Address = require("../../models/Address");
const { otpGen } = require("otp-gen-agent");
const jwt = require("jsonwebtoken");

/**
 * Customer Login : loginStep1 : send OTP
 * Type : POST
 * Route : /artist/login/send-code
 */
exports.loginStep1 = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const code = await otpGen();

    const user = await User.findOne({
      phone_number,
      user_role: USER_ROLE_ARTIST,
    });
    //if phone number is not in the DB,
    //creating a temp user
    if (!user) {
      let newTempUser = new User({
        first_name: "User",
        phone_number: phone_number,
        user_role: USER_ROLE_ARTIST,
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
          return res.send({ error: false, code, isNewUser: true });
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
          return res.send({ error: false, code, isNewUser: false });
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
 * Route : /artist/login/verify-code
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
