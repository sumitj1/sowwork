/**
 * Customer Login : loginStep2 : verify OTP
 * Type : POST
 * Route : /artist/login/verify-code
 */
exports.saveBasicInfo = async (req, res) => {
  try {
    const { _id } = req.user;
    const { email, first_name, last_name } = req.body;
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
