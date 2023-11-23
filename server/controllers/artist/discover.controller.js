const { STATUS_ACTIVE } = require("../../config/constants");
const Post = require("../../models/Post");
const Bookmark = require("../../models/Bookmark");

/**
 * ADD a POST
 * Type : POST
 * Route : /artist/posts
 */
exports.addPost = async (req, res) => {
  try {
    const { image, category, id } = req.body;
    const userId = req?.user?._id || id;

    let newTempUser = new Post({
      image,
      category,
      status: STATUS_ACTIVE,
      user: userId,
    });

    await newTempUser.save();

    res.send({ error: false, message: "Post added." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get All Posts
 * Type : GET
 * Route : /artist/discover/post/get-all
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
 * Bookmark Post
 * Type : GET
 * Route : /artist/discover/post/bookmark/:id   :: post id
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
 * Route : /artist/discover/post/get-bookmarks
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
