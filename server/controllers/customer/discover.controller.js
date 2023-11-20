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
    const posts = await Post.find({
      status: STATUS_ACTIVE,
    })
      .populate("user")
      .populate("comments.user")
      .sort("created_at : -1");

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

    let newBookmark = new Bookmark({
      post: _id,
      user: user_id,
      status: STATUS_ACTIVE,
    });

    newBookmark = await newBookmark.save();

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
    const { _id } = req.params;
    let updatedBookmark = await Bookmark.findByIdAndUpdate(
      {
        _id: _id,
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
