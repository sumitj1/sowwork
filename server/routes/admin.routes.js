const router = require("express").Router();
const IndexRouter = require("../controllers/admin/index.contoller");
const ReportRouter = require("../controllers/admin/report.controller");
const { authAdmin } = require("../middleware/auth.middleware");

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
module.exports = router;
