const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

// Controllers import
const feedController = require("../controller/feed");

router.get("/posts", feedController.getPosts);
router.post(
    "/post",
    [
        body("title")
            .trim()
            .isLength({ max: 14 })
            .withMessage("The title is required 5~14 characters"),
        body("content")
            .trim()
            .isLength({ max: 140 })
            .withMessage("The content is required 5~140 characters"),
    ],
    feedController.createPost
);

router.get("/post/:id", feedController.getSinglePost);
router.put("/post/update/:id", feedController.updatePost);

module.exports = router;
