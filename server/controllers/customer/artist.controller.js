const { STATUS_ACTIVE } = require("../../config/constants");
const Review = require("../../models/Review");
const User = require("../../models/User");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

/**
 * Get Artist By Id
 * Type : GET
 * Route : /customer/artist/get-by-id
 */
exports.getArtistById = async (req, res) => {
  try {
    const { _id } = req.params;

    const user = await User.aggregate([
      {
        $match: {
          $and: [{ _id: new ObjectId(_id) }, { status: STATUS_ACTIVE }],
        },
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          phone_number: 1,
          profile_image: 1,
          about: 1,
          created_at: 1,
          address: 1,
        },
      },
    ]);

    res.send({ error: false, user: user });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Artist By Id
 * Type : GET
 * Route : /customer/artist/get-by-id
 */
exports.addReview = async (req, res) => {
  try {
    const { _id } = req.user;
    const { review, rating, artist } = req.body;

    Review.create({
      review,
      rating,
      artist,
      user: _id,
    }).then(() => {
      res.send({ error: false, message: "Review added." });
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
