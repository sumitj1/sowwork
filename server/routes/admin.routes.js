const router = require("express").Router();
const IndexRouter = require("../controllers/admin/index.contoller");

router.post("/signup", IndexRouter.signup);
router.post("/login", IndexRouter.login);

module.exports = router;
