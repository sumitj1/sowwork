const {
  STATUS_ACTIVE,
  REPORT_TYPE_POST,
  STATUS_PENDING,
  STATUS_DELETED,
  REPORT_TYPE_COMMENT,
} = require("../../config/constants");
const Post = require("../../models/Post");
const Report = require("../../models/Report");
const Bookmark = require("../../models/Bookmark");
const mongoose = require("mongoose");
const {
  formatNumber,
  getTimeDifferenceText,
} = require("../../utils/common.functions");
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
      // {
      //   $match: {
      //     "comments.status": STATUS_ACTIVE,
      //   },
      // },
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
      // {
      //   $lookup: {
      //     from: "address",
      //     localField: "user",
      //     foreignField: "user",
      //     as: "address",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$address",
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
          comments: 1,
          isBookmarked: 1,
        },
      },
    ]);

    for (let post of posts) {
      let reactions = [];
      // finding userId
      // if (post?.reactions?.love?.includes(userId)) {
      //   post.selectedReaction = "love";
      // } else if (post?.reactions?.happy?.includes(userId)) {
      //   post.selectedReaction = "happy";
      // } else if (post?.reactions?.surprise?.includes(userId)) {
      //   post.selectedReaction = "surprise";
      // } else if (post?.reactions?.laugh?.includes(userId)) {
      //   post.selectedReaction = "laugh";
      // } else {
      //   post.selectedReaction = null;
      // }

      //setting count by rections length and formatting
      // post.reactions.love = post?.reactions?.love?.length
      //   ? formatNumber(post?.reactions?.love?.length)
      //   : formatNumber(1500);
      // post.reactions.happy = post?.reactions?.happy?.length
      //   ? formatNumber(post?.reactions?.happy?.length)
      //   : formatNumber(2300);
      // post.reactions.surprise = post?.reactions?.surprise?.length
      //   ? formatNumber(post?.reactions?.surprise?.length)
      //   : formatNumber(100);
      // post.reactions.laugh = post?.reactions?.laugh?.length
      //   ? formatNumber(post?.reactions?.laugh?.length)
      //   : formatNumber(4043);
      // const keys = Object.keys(post?.reactions);

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

      // for (let i = 0; i < keys.length; i++) {
      //   const key = keys[i];
      //   let value = post?.reactions[key];

      //   reactions.push({
      //     id: i,
      //     img: i + 6,
      //     isclick: post?.reactions[reaction[i]]?.includes(userId),
      //     count: post?.reactions[reaction[i]]?.length,
      //     name: reaction[i],
      //   });
      // }

      // for (let i = 0; i < keys.length; i++) {
      //   const key = keys[i];
      //   console.log(
      //     "🚀 ~ file: discover.controller.js:230 ~ exports.getAllPosts= ~ key:",
      //     key
      //   );
      //   let value = post?.reactions[key];
      //   console.log(
      //     "🚀 ~ file: discover.controller.js:219 ~ exports.getAllPosts= ~ value:",
      //     value
      //   );

      //   reactions.push({
      //     id: i,
      //     img: i,
      //     isclick: value.includes(userId),
      //     count: value.length,
      //     name: key,
      //   });
      // }

      //formatting time
      post.post_time = getTimeDifferenceText(post.created_at);
      post.reaction = reactions;
      delete post.reactions;
    }

    res.send({ error: false, data: posts });
  } catch (error) {
    console.log(
      "🚀 ~ file: discover.controller.js:209 ~ exports.getAllPosts= ~ error:",
      error
    );
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

    //checking if already reported
    let report = await Report.findOne({
      type: REPORT_TYPE_POST,
      reported_to: _id,
      reported_by: user_id,
    });

    if (report) throw new Error("Already Reported!");

    let newReport = new Report({
      reason,
      type: REPORT_TYPE_POST,
      reported_to: _id,
      post_id: _id,
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
    console.log(
      "🚀 ~ file: discover.controller.js:410 ~ exports.getBookmarks= ~ user_id:",
      user_id
    );
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
            // {
            //   $match: {
            //     "comments.status": STATUS_ACTIVE,
            //   },
            // },
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
      reactions = [];
      // finding userId
      // if (bookmark?.reactions?.love?.includes(user_id)) {
      //   bookmark.selectedReaction = "love";
      // } else if (bookmark?.reactions?.happy?.includes(user_id)) {
      //   bookmark.selectedReaction = "happy";
      // } else if (bookmark?.reactions?.surprise?.includes(user_id)) {
      //   bookmark.selectedReaction = "surprise";
      // } else if (bookmark?.reactions?.laugh?.includes(user_id)) {
      //   bookmark.selectedReaction = "laugh";
      // } else {
      //   bookmark.selectedReaction = null;
      // }

      //setting count by rections length and formatting
      // bookmark.reactions.love = bookmark?.reactions?.love?.length
      //   ? formatNumber(bookmark?.reactions?.love?.length)
      //   : formatNumber(1500);
      // bookmark.reactions.happy = bookmark?.reactions?.happy?.length
      //   ? formatNumber(bookmark?.reactions?.happy?.length)
      //   : formatNumber(2300);
      // bookmark.reactions.surprise = bookmark?.reactions?.surprise?.length
      //   ? formatNumber(bookmark?.reactions?.surprise?.length)
      //   : formatNumber(100);
      // bookmark.reactions.laugh = bookmark?.reactions?.laugh?.length
      //   ? formatNumber(bookmark?.reactions?.laugh?.length)
      //   : formatNumber(4043);

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
      bookmark.reactions;
      delete bookmark.reactions;
      data.push(bookmark);
    }

    res.send({ error: false, data: data });
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

/**
 * Report Comment
 * Type : POST
 * Route : /customer/discover/comment/report
 */
exports.reportComment = async (req, res) => {
  try {
    const { _id, reason } = req.body;
    const user_id = req.user._id;

    //checking if already reported
    let report = await Report.findOne({
      type: REPORT_TYPE_COMMENT,
      reported_to: _id,
      reported_by: user_id,
    });

    if (report) throw new Error("Already Reported!");

    let postData = await Post.findOne({
      "comments._id": new ObjectId(_id),
    }).populate("comments");

    if (!postData) throw new Error("Post not found");
    let newReport = new Report({
      reason,
      type: REPORT_TYPE_COMMENT,
      reported_to: _id,
      post_id: postData._id,
      reported_by: user_id,
      status: STATUS_PENDING,
    });

    newReport = await newReport.save();

    res.send({ error: false, message: "Comment Reported." });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * React on Post
 * Type : POST
 * Route : /customer/discover/post/react
 */
exports.reactOnPost = async (req, res) => {
  try {
    const { _id, reaction } = req.body;
    console.log(
      "🚀 ~ file: discover.controller.js:573 ~ exports.reactOnPost= ~ req.body:",
      req.body
    );
    const user_id = req.user._id;
    let reactionName;
    let previousLikedReaction;
    for (const elem of reaction) {
      if (elem.isclick === true) reactionName = elem.name;
    }
    console.log(
      "🚀 ~ file: discover.controller.js:577 ~ exports.reactOnPost= ~ reactionName:",
      reactionName
    );
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
      console.log(
        "🚀 ~ file: discover.controller.js:606 ~ exports.reactOnPost= ~ query:",
        query
      );

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
      console.log(
        "🚀 ~ file: discover.controller.js:606 ~ exports.reactOnPost= ~ query:",
        query
      );

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
