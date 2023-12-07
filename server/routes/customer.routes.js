const router = require("express").Router();
const IndexRouter = require("../controllers/customer/index.controller");
const DiscoverRouter = require("../controllers/customer/discover.controller");
const NotificationRouter = require("../controllers/customer/notification.controller");

const { authCustomer } = require("../middleware/auth.middleware");

//common routes
router.post("/login/send-code", IndexRouter.loginStep1);
router.post("/login/verify-code", IndexRouter.loginStep2);

//profile routes
router.get("/my-profile", authCustomer, IndexRouter.getProfileDetails);
router.post("/update-profile", authCustomer, IndexRouter.updateProfile);
router.post("/my-profile/address", authCustomer, IndexRouter.addAddress);
router.get("/my-profile/address", authCustomer, IndexRouter.getAddress);
router.get(
  "/my-profile/address/:_id",
  authCustomer,
  IndexRouter.getAddressById
);
router.post(
  "/my-profile/address/update",
  authCustomer,
  IndexRouter.updateAddress
);
router.get(
  "/my-profile/address/change-status/:type/:_id",
  authCustomer,
  IndexRouter.changeAddressStatus
);

//discover routes
router.get("/discover/post/get-all", authCustomer, DiscoverRouter.getAllPosts);
router.post("/discover/post/report", authCustomer, DiscoverRouter.reportPost);
router.post("/discover/post/react", authCustomer, DiscoverRouter.reactOnPost);

//comment routes
router.post(
  "/discover/post/add-comment",
  authCustomer,
  DiscoverRouter.addCommentOnPost
);
router.post(
  "/discover/comment/report",
  authCustomer,
  DiscoverRouter.reportComment
);

//Bookmark routes
router.get(
  "/discover/post/bookmark/:_id",
  authCustomer,
  DiscoverRouter.bookmarkPost
);
router.get(
  "/discover/post/get-bookmarks",
  authCustomer,
  DiscoverRouter.getBookmarks
);

router.get(
  "/discover/post/remove-bookmark/:postId",
  authCustomer,
  DiscoverRouter.removeBookmark
);

//notifications routes
router.get(
  "/notification",
  authCustomer,
  NotificationRouter.getAllNotifications
);

module.exports = router;
