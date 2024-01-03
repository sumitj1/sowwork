const {
  STATUS_PENDING,
  STATUS_ACTIVE,
  REPORT_TYPE_POST,
  REPORT_TYPE_COMMENT,
  STATUS_INACTIVE,
  STATUS_RESOLVED,
  STATUS_BLOCKED,
} = require("../../config/constants");
const Post = require("../../models/Post");
const Report = require("../../models/Report");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

/**
 * Get Post Reports
 * Type : GET
 * Route : /admin/report/post
 */
exports.getPostReports = async (req, res) => {
  try {
    let postReports = await Report.aggregate([
      {
        $match: {
          status: STATUS_PENDING,
          type: REPORT_TYPE_POST,
        },
      },
      {
        $lookup: {
          from: `posts`,
          let: { id: "$reported_to" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$id"] },
                    { $eq: ["$status", STATUS_ACTIVE] },
                    { $eq: ["$is_deleted", false] },
                  ],
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
              $unwind: "$user",
            },
          ],
          as: "post",
        },
      },
      {
        $unwind: "$post",
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $project: {
          _id: 1,
          reason: 1,
          reported_by: 1,
          post: {
            _id: 1,
            caption: 1,
            image: 1,
            user: {
              _id: 1,
              first_name: 1,
              last_name: 1,
            },
          },
          created_at: 1,
          updated_at: 1,
        },
      },
    ]);

    const blockedCount = await Report.find({
      status: STATUS_BLOCKED,
      type: REPORT_TYPE_COMMENT,
    }).count();

    res.send({
      error: false,
      data: postReports,
      reportedCount: postReports.length,
      blockedCount: blockedCount,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: report.controller.js:12 ~ exports.getReports=async ~ error:",
      error
    );
    res.send({ error: true, message: error.message });
  }
};

/**
 * Get Comment Reports
 * Type : GET
 * Route : /admin/report/comment
 */
exports.getCommentReports = async (req, res) => {
  try {
    let commentReports = await Report.aggregate([
      {
        $match: {
          status: STATUS_PENDING,
          type: REPORT_TYPE_COMMENT,
        },
      },
      {
        $lookup: {
          from: `posts`,
          let: { id: "$post_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$id"] },
                    { $eq: ["$status", STATUS_ACTIVE] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
          ],

          as: "post",
        },
      },
      {
        $unwind: "$post",
      },
      {
        $unwind: "$post.comments",
      },
      {
        $match: {
          $expr: { $eq: ["$post.comments._id", "$reported_to"] },
        },
      },
      {
        $project: {
          _id: 1,
          reason: 1,
          reported_by: 1,
          comments: {
            _id: "$post.comments._id",
            user: "$post.comments.user",
            comment: "$post.comments.comment",
          },
          created_at: 1,
          updated_at: 1,
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
        $unwind: "$comments.user",
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $project: {
          _id: 1,
          reason: 1,
          reported_by: 1,
          comments: {
            _id: 1,
            user: {
              _id: 1,
              first_name: 1,
              last_name: 1,
            },
            comment: 1,
          },
          created_at: 1,
          updated_at: 1,
        },
      },
      {
        $group: {
          _id: "$comments._id",
          reason: { $first: "$reason" },
          reported_by: { $first: "$reported_by" },
          comments: { $first: "$comments" },
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          report_count: { $sum: 1 },
        },
      },
    ]);

    const blockedCount = await Report.find({
      status: STATUS_BLOCKED,
      type: REPORT_TYPE_COMMENT,
    }).count();

    res.send({
      error: false,
      data: commentReports,
      reportedCount: commentReports.length,
      blockedCount: blockedCount,
    });
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};

/**
 * Change Comment Status
 * Type : GET
 * Route : /report/comment/change-status/:type/:comment_id
 */
exports.changeCommentStatus = async (req, res) => {
  try {
    const { type, comment_id } = req.params;

    switch (type) {
      case "block":
        let updatedComment = await Post.findOneAndUpdate(
          {
            "comments._id": new ObjectId(comment_id),
          },
          {
            $set: {
              "comments.$.status": STATUS_BLOCKED,
              updated_at: new Date().toISOString(),
            },
          },
          {
            new: true,
          }
        );

        await Report.updateMany(
          {
            reported_to: new ObjectId(comment_id),
          },
          {
            $set: {
              status: STATUS_BLOCKED,
              updated_at: new Date().toISOString(),
            },
          },
          { multi: true }
        );

        res.send({ error: false, message: `Comment blocked successfully.` });
        break;

      case "ignore":
        await Report.updateMany(
          {
            reported_to: new ObjectId(comment_id),
          },
          {
            $set: {
              status: STATUS_RESOLVED,
              updated_at: new Date().toISOString(),
            },
          },
          { multi: true }
        );
        res.send({ error: false, message: `Comment ignored successfully.` });
        break;

      default:
        throw new Error("Invalid type");
        break;
    }
  } catch (error) {
    console.log(
      "🚀 ~ file: report.controller.js:233 ~ exports.changeCommentStatus= ~ error:",
      error
    );
    res.send({ error: true, message: error.message });
  }
};

/**
 * Change Post Status
 * Type : GET
 * Route : /report/post/change-status/:type/:post_id
 */
exports.changePostStatus = async (req, res) => {
  try {
    const { type, post_id } = req.params;
    switch (type) {
      case "block":
        await Post.findByIdAndUpdate(new ObjectId(post_id), {
          $set: {
            status: STATUS_BLOCKED,
            updated_at: new Date().toISOString(),
          },
        });

        await Report.updateMany(
          {
            reported_to: new ObjectId(post_id),
          },
          {
            $set: {
              status: STATUS_BLOCKED,
              updated_at: new Date().toISOString(),
            },
          }
        );

        res.send({ error: false, message: `Post blocked successfully.` });
        break;

      case "ignore":
        await Report.updateMany(
          {
            reported_to: new ObjectId(post_id),
          },
          {
            $set: {
              status: STATUS_RESOLVED,
              updated_at: new Date().toISOString(),
            },
          }
        );
        res.send({ error: false, message: `Post ignored successfully.` });
        break;

      default:
        throw new Error("Invalid type:" + type);
    }
  } catch (error) {
    res.send({ error: true, message: error.message });
  }
};
