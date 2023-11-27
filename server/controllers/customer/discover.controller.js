const {
  STATUS_ACTIVE,
  REPORT_TYPE_POST,
  STATUS_PENDING,
  STATUS_DELETED,
} = require("../../config/constants");
const Post = require("../../models/Post");
const Report = require("../../models/Report");
const Bookmark = require("../../models/Bookmark");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

/**
 * Get All Posts
 * Type : GET
 * Route : /customer/discover/post/get-all
 */
exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.aggregate([
      {
        $match: {
          status: STATUS_ACTIVE,
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
        $unwind: "$user",
      },
      { $unwind: "$comments" },
      {
        $lookup: {
          from: "users",
          localField: "comments.user",
          foreignField: "_id",
          as: "comments.user",
        },
      },
      { $unwind: "$comments.user" },
      {
        $project: {
          _id: 1,
          category: 1,
          image: 1,
          status: 1,
          user: {
            first_name: 1,
            last_name: 1,
            _id: 1,
          },
          is_deleted: 1,
          created_at: 1,
          "comments._id": 1,
          "comments.comment": 1,
          "comments._is_deleted": 1,
          "comments.created_at": 1,
          "comments.user": {
            first_name: 1,
            last_name: 1,
            _id: 1,
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          category: { $first: "$category" },
          image: { $first: "$image" },
          status: { $first: "$status" },
          user: { $first: "$user" },
          is_deleted: { $first: "$is_deleted" },
          created_at: { $first: "$created_at" },
          comments: { $push: "$comments" },
        },
      },
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
          user: 1,
          is_deleted: 1,
          created_at: 1,
          comments: 1,
          isBookmarked: 1,
        },
      },
    ]);

    res.send({ error: false, data: posts });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Add Comment On Post
 * Type : POST
 * Route : /customer/discover/post/add-comment
 */
exports.addCommentOnPost = async (req, res) => {
  try {
    const { _id, comment } = req.body;
    const user_id = req.user._id;

    await Post.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        $push: {
          comments: {
            comment,
            user: user_id,
          },
        },
      }
    );
    res.send({ error: false, message: "Comment Added" });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Add Comment On Post
 * Type : POST
 * Route : /customer/discover/post/add-comment
 */
exports.addReactionOnPost = async (req, res) => {
  try {
    const { _id, reaction } = req.body;
    const user_id = req.user._id;

    // await Post.findByIdAndUpdate(
    //   {
    //     _id: _id,
    //   },
    //   {
    //     $push: {
    //       comments: {
    //         comment,
    //         user: user_id,
    //       },
    //     },
    //   }
    // );
    res.send({ error: false, message: "Comment Added" });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Report Post
 * Type : POST
 * Route : /customer/discover/post/report
 */
exports.reportPost = async (req, res) => {
  try {
    const { _id, reason } = req.body;
    const user_id = req.user._id;

    let newReport = new Report({
      reason,
      type: REPORT_TYPE_POST,
      reported_to: _id,
      reported_by: user_id,
      status: STATUS_PENDING,
    });

    newReport = await newReport.save();

    res.send({ error: false, message: "Post Reported." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Bookmark Post
 * Type : GET
 * Route : /customer/discover/post/bookmark/:id   :: post id
 */
exports.bookmarkPost = async (req, res) => {
  try {
    const { _id } = req.params;
    const user_id = req.user._id;

    const bookmark = await Bookmark.findOne({
      post: _id,
      user: user_id,
    });

    if (!bookmark) {
      let newBookmark = new Bookmark({
        post: _id,
        user: user_id,
        status: STATUS_ACTIVE,
      });

      newBookmark = await newBookmark.save();
    } else {
      updatedBookmark = await Bookmark.findByIdAndUpdate(bookmark._id, {
        $set: {
          status: STATUS_ACTIVE,
          is_deleted: false,
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      });
    }

    res.send({ error: false, message: "Post Bookmarked." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Bookmarks
 * Type : GET
 * Route : /customer/discover/post/get-bookmarks
 */
exports.getBookmarks = async (req, res) => {
  try {
    const user_id = req.user._id;

    let bookmarks = await Bookmark.find({
      status: STATUS_ACTIVE,
      user: user_id,
    })
      .populate("post")
      .sort("created_at : -1");

    res.send({ error: false, data: bookmarks });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Remove Bookmark
 * Type : GET
 * Route : /customer/discover/post/remove-bookmark/:_id  :: bookmark id
 */
exports.removeBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    let updatedBookmark = await Bookmark.findOneAndUpdate(
      {
        post: new ObjectId(postId),
      },
      {
        status: STATUS_DELETED,
        is_deleted: true,
        updated_at: new Date().toISOString(),
        deleted_at: new Date().toISOString(),
      }
    );
    if (!updatedBookmark) throw new Error("Bookmark not found.");

    res.send({ error: false, message: "Bookmark Removed" });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
