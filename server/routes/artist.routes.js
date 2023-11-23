const DiscoverRouter = require("../controllers/artist/discover.controller");
const UploadRouter = require("../controllers/upload.controller");
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
module.exports = router;
