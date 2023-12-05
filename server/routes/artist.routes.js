const DiscoverRouter = require("../controllers/artist/discover.controller");
const UploadRouter = require("../controllers/upload.controller");
const NotificationRouter = require("../controllers/artist/notification.controller");

const router = require("express").Router();

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

module.exports = router;
