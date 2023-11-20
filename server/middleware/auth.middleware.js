const { JWT_SECRET } = require("../config/constants");
const jwt = require("jsonwebtoken");

const authCustomer = (req, res, next) => {
  try {
    const authHeader = req.header("token") || req.header("TOKEN");

    if (!authHeader) throw new Error("Token not found.");

    const token = authHeader.split(" ")[1]; // Get the token part from the header

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) throw new Error("Invalid token.");

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: true, message: error.message });
  }
};

module.exports = {
  authCustomer,
};
