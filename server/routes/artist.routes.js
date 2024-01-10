const DiscoverRouter = require("../controllers/artist/discover.controller");
const UploadRouter = require("../controllers/upload.controller");
const NotificationRouter = require("../controllers/artist/notification.controller");
const IndexRouter = require("../controllers/artist/index.controller");
const ProfileRouter = require("../controllers/artist/profile.controller");
const { authArtist } = require("../middleware/auth.middleware");

const router = require("express").Router();

//common routes
router.post("/login/send-code", IndexRouter.loginStep1);
router.post("/login/verify-code", IndexRouter.loginStep2);

//posts
router.post(
  "/posts/upload-image",
  UploadRouter.upload.single("image"),
  UploadRouter.uploadSingleFile
);
router.post("/posts", DiscoverRouter.addPost);

//discover routes
router.get("/discover/post/get-all", DiscoverRouter.getAllPosts);

//Bookmark routes
router.get("/discover/post/bookmark/:_id", DiscoverRouter.bookmarkPost);
router.get("/discover/post/get-bookmarks", DiscoverRouter.getBookmarks);

//notifications
router.post("/notification", NotificationRouter.addNotification);

//profile routes
router.post("/profile/basic-info", authArtist, ProfileRouter.saveBasicInfo);
router.post("/profile/address-info", authArtist, ProfileRouter.saveAddressInfo);
router.get(
  "/profile/get-specializations",
  authArtist,
  ProfileRouter.getSpecializations
);

module.exports = router;
