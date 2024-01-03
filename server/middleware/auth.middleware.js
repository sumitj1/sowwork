const {
  JWT_SECRET,
  USER_ROLE_ADMIN,
  USER_ROLE_CUSTOMER,
  USER_ROLE_ARTIST,
} = require("../config/constants");
const jwt = require("jsonwebtoken");

const authCustomer = (req, res, next) => {
  try {
    const authHeader = req.header("token") || req.header("TOKEN");
    if (!authHeader) throw new Error("Token not found.");

    const token = authHeader.split(" ")[1]; // Get the token part from the header

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) throw new Error("Invalid token.");

      if (user.user_role !== USER_ROLE_CUSTOMER)
        throw new Error("Invalid token.");

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: true, message: error.message });
  }
};

const authArtist = (req, res, next) => {
  try {
    const authHeader = req.header("token") || req.header("TOKEN");
    if (!authHeader) throw new Error("Token not found.");

    const token = authHeader.split(" ")[1]; // Get the token part from the header

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) throw new Error("Invalid token.");

      if (user.user_role !== USER_ROLE_ARTIST)
        throw new Error("Invalid token.");

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: true, message: error.message });
  }
};

const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.header("token") || req.header("TOKEN");
    if (!authHeader) throw new Error("Token not found.");

    const token = authHeader.split(" ")[1]; // Get the token part from the header

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) throw new Error("Invalid token.");

      if (user.user_role !== USER_ROLE_ADMIN) throw new Error("Invalid token.");
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: true, message: error.message });
  }
};

module.exports = {
  authCustomer,
  authArtist,
  authAdmin,
};
