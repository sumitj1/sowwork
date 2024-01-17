const {
  STATUS_ACTIVE,
  STATUS_DELETED,
  PACKAGE_TYPE_BASIC,
  PACKAGE_TYPE_STANDARD,
  PACKAGE_TYPE_PREMIUM,
} = require("../../config/constants");
const User = require("../../models/User");
const Specialization = require("../../models/specialization");
const Kyc = require("../../models/kyc");
const mongoose = require("mongoose");
const Address = require("../../models/Address");
const { getSpecializations } = require("../common.controller");
const Package = require("../../models/Package");
const Post = require("../../models/Post");
const { getTimeDifferenceText } = require("../../utils/common.functions");
const Review = require("../../models/Review");
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
    const specializations = await getSpecializations();
    if (specializations && !specializations.error)
      console.log(specializations.message);

    res.send({ error: true, data: specializations || [] });
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

    let specializations = await getSpecializations();
    if (specializations && !specializations.error)
      console.log(specializations.message);
    res.send({
      error: false,
      data: user,
      specializations: specializations.data || [],
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Update profile Data
 * TYPE : POST
 * Route : /profile/update-profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      first_name,
      last_name,
      phone_number,
      profile_image,
      cover_image,
      address_line_1,
      address_line_2,
      landmark,
      pincode,
      city,
      state,
      email,
      category,
      specialization,
      sub_specialization,
    } = req.body;

    let specializationDetails = await Specialization.findOne({
      category_name: category,
    });

    if (!specializationDetails) throw new Error("Specialization not found.");
    let specializationObj = {
      category: specializationDetails._id,
    };

    for (let elem of specializationDetails.specializations) {
      if (elem.specialization_name == specialization) {
        specializationObj.specialization = elem._id;
        for (let elem2 of elem.sub_specializations) {
          if (elem2.sub_specialization_name == sub_specialization) {
            specializationObj.sub_specialization = elem2._id;
          }
        }
      }
    }

    User.findByIdAndUpdate(_id, {
      $set: {
        first_name,
        last_name,
        email,
        phone_number,
        address: {
          address_line_1,
          address_line_2,
          landmark,
          pincode,
          city,
          state,
        },
        profile_image,
        cover_image,
        specializations: specializationObj,
      },
    }).then((data) => {
      res.send({ error: false, message: "Profile updated.", data });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/********  Packages ********/

/**
 * Add Package
 * Type : POST
 * Route : /profile/package
 */
exports.addUpdatePackage = async (req, res) => {
  try {
    const { _id } = req.user;
    const { price, details, type } = req.body;

    if (
      type !== PACKAGE_TYPE_BASIC &&
      type !== PACKAGE_TYPE_STANDARD &&
      type !== PACKAGE_TYPE_PREMIUM
    )
      throw new Error("Invalid Package type");

    await Package.findOneAndUpdate(
      {
        artist: _id,
        type: type,
      },
      {
        $set: {
          price,
          details,
          artist: _id,
          type,
        },
      },
      {
        upsert: true,
      }
    ).then(() => {
      res.send({ error: false, message: "Package updated successfully" });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Package By Type
 * Type : GET
 * Route : /profile/package/get-by-type/:type
 */
exports.getPackageByType = async (req, res) => {
  try {
    const { _id } = req.user;
    const { type } = req.params;

    if (
      type !== PACKAGE_TYPE_BASIC &&
      type !== PACKAGE_TYPE_STANDARD &&
      type !== PACKAGE_TYPE_PREMIUM
    )
      throw new Error("Invalid Package type");

    const package = await Package.findOne({
      artist: _id,
      type,
    }).select("type created_at details price status");
    res.send({ error: false, data: package });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get all portfolio posts
 * TYPE : Get
 * Route : /profile/portfolio/get-all
 */
exports.getAllPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.aggregate([
      {
        $match: {
          $and: [
            { status: STATUS_ACTIVE },
            { user: { $ne: new ObjectId(userId) } },
            { post_on_portfolio: true },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $unwind: {
      //     path: "$comments",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "comments.user",
      //     foreignField: "_id",
      //     as: "comments.user",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$comments.user",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $project: {
          _id: 1,
          category: 1,
          image: 1,
          status: 1,
          reactions: 1,
          caption: 1,
          user: {
            first_name: 1,
            last_name: 1,
            _id: 1,
            profile_image: 1,
            address: 1,
          },
          is_deleted: 1,
          created_at: 1,
          // "comments._id": 1,
          // "comments.comment": 1,
          // "comments._is_deleted": 1,
          // "comments.created_at": 1,
          // "comments.user": {
          //   first_name: 1,
          //   last_name: 1,
          //   _id: 1,
          // },
        },
      },
      // {
      //   $group: {
      //     _id: "$_id",
      //     category: { $first: "$category" },
      //     image: { $first: "$image" },
      //     status: { $first: "$status" },
      //     reactions: { $first: "$reactions" },
      //     caption: { $first: "$caption" },
      //     user: { $first: "$user" },
      //     is_deleted: { $first: "$is_deleted" },
      //     created_at: { $first: "$created_at" },
      //     comments: { $push: "$comments" },
      //   },
      // },
      {
        $lookup: {
          from: "bookmarks",
          let: { postId: "$_id" }, // Variable to store the post ID from posts collection
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$postId"] }, // Match bookmark's postId with post's _id
                    { $eq: ["$user", new ObjectId(userId)] }, // Match bookmark's userId with current user's ID
                    { $eq: ["$status", STATUS_ACTIVE] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
          ],
          as: "bookmarks", // Store matched bookmarks in an array field called "bookmarks"
        },
      },
      {
        $addFields: {
          isBookmarked: {
            $cond: {
              if: { $eq: [{ $size: "$bookmarks" }, 0] }, // Check if bookmarks array is empty
              then: false, // No bookmarks found for this post and user
              else: true, // Bookmarks found for this post and user
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          image: 1,
          status: 1,
          reactions: 1,
          caption: 1,
          user: 1,
          is_deleted: 1,
          created_at: 1,
          // comments: 1,
          isBookmarked: 1,
        },
      },
    ]);

    for (let post of posts) {
      let reactions = [];

      let reaction = ["love", "surprise", "laugh", "happy"];
      //Looping through the object using the keys and accessing the index
      for (let i = 0; i < reaction.length; i++) {
        reactions.push({
          id: i,
          img: i + 6,
          isclick: post?.reactions[reaction[i]]?.includes(userId),
          count: post?.reactions[reaction[i]]?.length,
          name: reaction[i],
        });
      }

      //formatting time
      post.post_time = getTimeDifferenceText(post.created_at);
      post.reaction = reactions;
      delete post.reactions;
    }
    res.send({ error: false, data: posts });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/** Get reviews
 * TYPE : Get
 * Route : /profile/reviews/get-all
 */
exports.getReviews = async (req, res) => {
  try {
    const { _id } = req.user;

    const reviews = await Review.find({
      artist: _id,
      status: STATUS_ACTIVE,
    }).populate({
      path: "user",
      model: "user",
      select: "first_name last_name",
    });

    res.send({ error: false, data: reviews });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
