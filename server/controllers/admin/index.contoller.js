const {
  USER_ROLE_ADMIN,
  STATUS_ACTIVE,
  JWT_SECRET,
} = require("../../config/constants");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/**
 * Admin Signup
 * Type : POST
 * Route : /admin/signup
 */
exports.signup = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, password } = req.body;

    const newUser = new User({
      first_name,
      last_name,
      email,
      phone_number,
      user_role: USER_ROLE_ADMIN,
      status: STATUS_ACTIVE,
    });
    newUser.password = newUser.genHashedPassword(password);

    newUser
      .save()
      .then(() => {
        res.send({ error: false, message: "Signed up successfully" });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Admin Login
 * Type : POST
 * Route : /admin/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log(
      "🚀 ~ file: index.contoller.js:45 ~ exports.login= ~ user:",
      user
    );
    //if email not found
    if (!user) throw new Error("Invalid Email!");
    //if role not admin
    if (user.user_role != USER_ROLE_ADMIN) throw new Error("Not Authorized!");
    //if password not mached

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) throw new Error("Invalid Email or Password");

    //token generation
    const token = jwt.sign(
      { _id: user._id, user_role: user.user_role, email: user.email },
      JWT_SECRET
    );

    let data = {
      _id: user._id,
      first_name: user.first_name,
      email: user.email,
      token: token,
    };

    res.send({ error: false, message: "You're in.", data });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
