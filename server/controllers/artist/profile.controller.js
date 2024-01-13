const { STATUS_ACTIVE } = require("../../config/constants");
const User = require("../../models/User");
const Specialization = require("../../models/specialization");
const Kyc = require("../../models/kyc");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
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

/**
 * Profile : Get Specializations
 * Type : GET
 * Route : /profile/get-specializations
 */
exports.getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find({
      status: STATUS_ACTIVE,
    });
    res.send({ error: true, data: specializations });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Profile : Get Specializations
 * Type : GET
 * Route : /profile/get-specializations
 */
exports.addKyc = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      aadhar_number,
      aadhar_photo_front,
      aadhar_photo_back,
      pan_number,
      pan_photo_front,
      pan_photo_back,
      selfie,
    } = req.body;

    Kyc.create({
      aadhar_number,
      aadhar_photo_front,
      aadhar_photo_back,
      pan_number,
      pan_photo_front,
      pan_photo_back,
      selfie,
      user: _id,
    }).then((data) => {
      res.send({
        error: false,
        message: "Details updated successfully",
        data: data,
      });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Profile : Set Specializations
 * Type : POST
 * Route : /profile/set-specialization
 */
exports.setSpecialization = async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("🚀 ~ exports.setSpecialization= ~ _id:", _id);
    const { category_id, specialization_id, sub_specialization_id } = req.body;
    console.log(
      "🚀 ~ exports.setSpecialization= ~ category_id, specialization_id, sub_specialization_id :",
      category_id,
      specialization_id,
      sub_specialization_id
    );

    User.findByIdAndUpdate(_id, {
      $set: {
        specializations: {
          category: category_id,
          specialization: specialization_id,
          sub_specialization: sub_specialization_id,
        },
      },
    }).then(() => {
      res.send({ error: false, message: "Specialization added" });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Profile : Get artist Details By Id
 * Type : GET
 * ROute  : /profile/get-artist-by-id/:_id
 */
exports.getArtistById = async (req, res) => {
  try {
    const userId = req.params._id;

    let user = await User.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
    ]);
    res.send({ error: false, data: user[0] });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
