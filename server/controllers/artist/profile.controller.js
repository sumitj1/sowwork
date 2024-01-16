const { STATUS_ACTIVE, STATUS_DELETED } = require("../../config/constants");
const User = require("../../models/User");
const Specialization = require("../../models/specialization");
const Kyc = require("../../models/kyc");
const mongoose = require("mongoose");
const Address = require("../../models/Address");
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
      {
        $lookup: {
          from: "specializations",
          localField: "specializations.category",
          foreignField: "_id",
          as: "specialization",
        },
      },
      {
        $unwind: "$specialization",
      },
    ]);
    if (user.length <= 0) throw new Error("Unable to get user details.");

    user = user[0];

    if (user.specialization) {
      user.specializations.category = user.specialization.category_name;
      user.specialization?.specializations.forEach((elem) => {
        if (String(elem._id) == String(user.specializations.specialization)) {
          user.specializations.specialization = elem.specialization_name;
          elem.sub_specializations.forEach((sub) => {
            if (
              String(sub._id) == String(user.specializations.sub_specialization)
            ) {
              user.specializations.sub_specialization =
                sub.sub_specialization_name;
            }
          });
        }
      });

      delete user.specialization;
    }
    res.send({ error: false, data: user });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Profile : Add Address
 * Type : POST
 * ROute  : /profile/address
 */
exports.addAddress = async (req, res) => {
  try {
    const { coordinates, address, building_number, name } = req.body;
    const { _id } = req.user;

    Address.create({
      coordinates,
      address,
      building_number,
      name,
      user: _id,
      status: STATUS_ACTIVE,
    }).then((data) => {
      res.send({ error: false, message: "Address saved", data: data });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Address
 * TYPE : GET
 * Route : /artist/profile/address
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
 * Route : /artist/profile/address/:id  :: Address Id
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
 * Route : /artist/profile/address/update
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
      },
    });

    if (!updatedAddress) throw new Error("Address not found.");
    res.send({ error: false, message: "Address updated successfully." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Delete Address
 * TYPE : GET
 * Route : /profile/address/delete/:id
 */
exports.deleteAddress = async (req, res) => {
  try {
    const { _id } = req.params;

    let obj = {
      status: STATUS_DELETED,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };

    const updatedAddressStatus = await Address.findByIdAndUpdate(_id, {
      $set: obj,
    });

    if (!updatedAddressStatus) throw new Error("Address not found.");
    res.send({ error: false, message: `Address deleted successfully.` });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get data to fill in Edit profile
 * TYPE : GET
 * Route : /profile/edit-profile
 */
exports.editProfile = async (req, res) => {
  try {
    const { _id } = req.user;

    let user = await User.aggregate([
      {
        $match: {
          _id: new ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "specializations",
          localField: "specializations.category",
          foreignField: "_id",
          as: "specialization",
        },
      },
      {
        $unwind: "$specialization",
      },
      {
        $project: {
          _id: 1,
          profile_image: 1,
          first_name: 1,
          last_name: 1,
          phone_number: 1,
          email: 1,
          address: 1,
          specialization: 1,
          specializations: 1,
          category: 1,
        },
      },
    ]);
    if (user.length <= 0) throw new Error("Unable to get user details.");

    user = user[0];

    if (user.specialization) {
      user.specializations.category = user.specialization.category_name;
      user.specialization?.specializations.forEach((elem) => {
        if (String(elem._id) == String(user.specializations.specialization)) {
          user.specializations.specialization = elem.specialization_name;
          elem.sub_specializations.forEach((sub) => {
            if (
              String(sub._id) == String(user.specializations.sub_specialization)
            ) {
              user.specializations.sub_specialization =
                sub.sub_specialization_name;
            }
          });
        }
      });

      delete user.specialization;
    }
    res.send({ error: false, data: user });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
