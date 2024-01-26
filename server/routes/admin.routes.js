const router = require("express").Router();
const IndexRouter = require("../controllers/admin/index.contoller");
const ReportRouter = require("../controllers/admin/report.controller");
const UserRouter = require("../controllers/admin/user.controller");
const { authAdmin } = require("../middleware/auth.middleware");
const Specialization = require("../models/specialization");

//general routes
router.post("/signup", IndexRouter.signup);
router.post("/login", IndexRouter.login);

//report routes
router.get("/report/post", authAdmin, ReportRouter.getPostReports);
router.get("/report/comment", authAdmin, ReportRouter.getCommentReports);
router.get(
  "/report/comment/change-status/:type/:comment_id",
  authAdmin,
  ReportRouter.changeCommentStatus
);
router.get(
  "/report/post/change-status/:type/:post_id",
  authAdmin,
  ReportRouter.changePostStatus
);

//users routes
router.get("/users/:role", authAdmin, UserRouter.getUsersByRole);

router.post("/specializations", async (req, res) => {
  console.log(req.body);

  Specialization.create({
    category_name: "music",
    specializations: {
      specialization_name: "singer",
      sub_specializations: {
        sub_specialization_name: "play back",
      },
    },
  }).then(() => {
    res.send({ error: false, message: "Added successfully" });
  });
});
module.exports = router;
