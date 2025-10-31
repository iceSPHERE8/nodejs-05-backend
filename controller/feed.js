const Post = require("../models/post");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");

exports.getPosts = (req, res, next) => {
    Post.find()
        .then((posts) => {
            res.status(200).json({
                posts: posts,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = `/images/${req.file.filename}`;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: { username: "fatony" },
    });

    post.save()
        .then((result) => {
            res.status(201).json({
                message: "Post Has Been Created!",
                post: result,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getSinglePost = (req, res, next) => {
    Post.findById(req.params.id)
        .then((post) => {
            // console.log(post);

            res.status(200).json({
                post: post,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 404;
            }
            next(err);
        });
};

exports.updatePost = (req, res, next) => {
    Post.findById(req.params.id)
        .then((post) => {
            post.title = req.body.title;
            post.content = req.body.content;

            const imageUrl = `/images/${req.file.filename}`

            if (req.file) {
                fs.unlink(path.join(__dirname, "..", post.imageUrl), err => console.log(err));
                post.imageUrl = imageUrl;
                
            }

            return post.save();
        })
        .then((result) => {
            res.status(200).json({
                message: "update success!",
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 422;
            }
            next(err);
        });
};
