const DiscoverRouter = require("../controllers/artist/discover.controller");
const router = require("express").Router();

//posts
router.post("/posts", DiscoverRouter.addPost);

//discover routes
router.get("/discover/post/get-all", DiscoverRouter.getAllPosts);

//Bookmark routes
router.get("/discover/post/bookmark/:_id", DiscoverRouter.bookmarkPost);
router.get("/discover/post/get-bookmarks", DiscoverRouter.getBookmarks);
module.exports = router;
