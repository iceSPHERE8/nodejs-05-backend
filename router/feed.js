const express = require("express");

const router = express.Router();

// Controllers import
const feedController = require("../controller/feed");

router.get("/posts", feedController.getPosts);
router.post("/post", feedController.createPost);

module.exports = router;