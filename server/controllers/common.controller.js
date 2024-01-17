const { STATUS_ACTIVE } = require("../config/constants");
const Specialization = require("../models/specialization");

/**
 * Get Specializations
 */
exports.getSpecializations = async () => {
  try {
    const specializations = await Specialization.find({
      status: STATUS_ACTIVE,
    });
    return { error: false, data: specializations };
  } catch (error) {
    return { error: true, message: error.message };
  }
};
