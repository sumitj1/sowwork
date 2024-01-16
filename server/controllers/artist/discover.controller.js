const { STATUS_ACTIVE } = require("../../config/constants");
const Post = require("../../models/Post");
const Bookmark = require("../../models/Bookmark");
const mongoose = require("mongoose");
const { getTimeDifferenceText } = require("../../utils/common.functions");
const { ObjectId } = mongoose.Types;
/**
 * ADD a POST
 * Type : POST
 * Route : /artist/posts
 */
exports.addPost = async (req, res) => {
  try {
    const { caption, post_on_portfolio, post_on_feed } = req.body;
    const userId = req.user._id;
    if (!req.file) throw new Error("Image not found.");
    const image = req.file.filename;

    await Post.create({
      image,
      post_on_portfolio,
      post_on_feed,
      user: userId,
      caption,
    }).then((post) => {
      res.send({ error: false, message: "Post added.", data: post });
    });
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
    const userId = req.user._id;
    const posts = await Post.aggregate([
      {
        $match: {
          $and: [
            { status: STATUS_ACTIVE },
            { user: { $ne: new ObjectId(userId) } },
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

/**
 * Bookmark Post
 * Type : GET
 * Route : /artist/discover/post/bookmark/:id   :: post id
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
      let updatedBookmark = await Bookmark.findByIdAndUpdate(bookmark._id, {
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
 * Route : /artist/discover/post/get-bookmarks
 */
exports.getBookmarks = async (req, res) => {
  try {
    const user_id = req.user._id;
    let data = [];
    let bookmarks = await Bookmark.aggregate([
      {
        $match: {
          $and: [{ status: STATUS_ACTIVE }, { user: new ObjectId(user_id) }],
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $lookup: {
          from: "posts",
          let: { postId: "$post" }, // Variable to hold the productId from orders
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$postId"] }],
                },
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
            {
              $unwind: {
                path: "$comments",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "comments.user",
                foreignField: "_id",
                as: "comments.user",
              },
            },
            {
              $unwind: {
                path: "$comments.user",
                preserveNullAndEmptyArrays: true,
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
                user: {
                  first_name: 1,
                  last_name: 1,
                  _id: 1,
                  profile_image: 1,
                  address: 1,
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
                reactions: { $first: "$reactions" },
                caption: { $first: "$caption" },
                user: { $first: "$user" },
                is_deleted: { $first: "$is_deleted" },
                created_at: { $first: "$created_at" },
                comments: { $push: "$comments" },
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
                comments: 1,
                isBookmarked: true,
              },
            },
          ],
          as: "post", // Output field to store joined product information
        },
      },
      {
        $unwind: "$post",
      },
    ]);

    for (let bookmark of bookmarks) {
      let bookmarkId = bookmark._id;
      bookmark = bookmark.post;
      bookmark.bookmarkId = bookmarkId;
      let reactions = [];

      let reaction = ["love", "surprise", "laugh", "happy"];
      // Looping through the object using the keys and accessing the index
      for (let i = 0; i < reaction.length; i++) {
        reactions.push({
          id: i,
          img: i + 6,
          isclick: bookmark?.reactions[reaction[i]]?.includes(user_id),
          count: bookmark?.reactions[reaction[i]]?.length,
          name: reaction[i],
        });
      }

      //formatting time
      bookmark.post_time = getTimeDifferenceText(bookmark.created_at);
      bookmark.reaction = reactions;
      delete bookmark.reactions;
      data.push(bookmark);
    }

    res.send({ error: false, data: data });
  } catch (error) {
    console.log("🚀 ~ exports.getBookmarks= ~ error:", error);
    res.send({ error: true, message: error.message });
  }
};

/**
 * React on Post
 * Type : POST
 * Route : /artist/discover/post/react
 */
exports.reactOnPost = async (req, res) => {
  try {
    const { _id, reaction } = req.body;

    const user_id = req.user._id;
    let reactionName;
    let previousLikedReaction;
    for (const elem of reaction) {
      if (elem.isclick === true) reactionName = elem.name;
    }

    const post = await Post.findById(_id).select("reactions");

    //finding the user Id from reactions array if exists
    if (post?.reactions?.happy.includes(user_id))
      previousLikedReaction = "happy";
    if (post?.reactions?.love.includes(user_id)) previousLikedReaction = "love";
    if (post?.reactions?.laugh.includes(user_id))
      previousLikedReaction = "laugh";
    if (post?.reactions?.surprise.includes(user_id))
      previousLikedReaction = "surprise";

    //removing previous reactions
    if (previousLikedReaction) {
      let pullQuery = "reactions." + previousLikedReaction;
      let query = {
        [pullQuery]: user_id,
      };

      let updatedPost = await Post.findByIdAndUpdate(
        _id,
        { $pull: query },
        { new: true }
      );
      if (!updatedPost)
        throw new Error("Unable to remove previous liked Emoji.");
    }

    //pushing new reaction
    if (reactionName) {
      let pushQuery = "reactions." + reactionName;
      let query = {
        [pushQuery]: user_id,
      };

      let updatedPost = await Post.findByIdAndUpdate(
        _id,
        { $push: query },
        { new: true }
      );
      if (!updatedPost) throw new Error("Unable to push liked Emoji.");
    }

    res.send({ error: false, message: "Reacted Successfully." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
