const Post = require("../models/post");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find()
        .countDocuments()
        .then((count) => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then((posts) => {
            res.status(200).json({
                posts: posts,
                totalPage: Math.ceil(totalItems / perPage),
                currentPage: currentPage,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
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

            let imageUrl = "";

            if (req.file) {
                imageUrl = `/images/${req.file.filename}`;

                fs.unlink(path.join(__dirname, "..", post.imageUrl), (err) =>
                    console.log(err)
                );
                post.imageUrl = imageUrl;
            }

            return post.save();
        })
        .then((result) => {
            res.status(200).json({
                message: "update success!",
                post: result,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 404;
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    Post.findById(req.params.id)
        .then((post) => {
            if (post) {
                return deleteImage(post.imageUrl).then(() => {
                    return Post.findOneAndDelete({ _id: req.params.id });
                });
            }
        })
        .then((result) => {
            // console.log(result);
            res.status(200).json({
                message: "delete success!",
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 404;
            }
            next(err);
        });
};

const deleteImage = (imageUrl) => {
    const imagePath = path.join(__dirname, "..", imageUrl);

    return new Promise((resolve, reject) => {
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.log(err);
                resolve();
            } else {
                resolve();
            }
        });
    });
};
