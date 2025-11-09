const Post = require("../models/post");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");

const socket = require("../socket");

const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 4;
    let totalItems;

    try {
        totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .sort({ createAt: -1 });

        res.status(200).json({
            posts: posts,
            totalPage: Math.ceil(totalItems / perPage),
            currentPage: currentPage,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = `/images/${req.file.filename}`;
    const userId = req.userId;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: userId,
    });

    try {
        await post.save();
        const user = await User.findById(userId);

        user.posts.push(post);
        await user.save();

        const io = socket.getIO();
        io.emit("posts", {
            action: "create",
            post: post,
        });

        res.status(201).json({
            message: "Post saved success!",
            post: post,
            creator: user,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSinglePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json({
            post: post,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 404;
        }
        next(err);
    }
};

exports.updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.creator.toString() !== req.userId) {
            const error = new Error("No authorized!");
            error.statusCode = 403;
            throw error;
        }

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

        const result = await post.save();

        const io = socket.getIO();
        io.emit("posts", {
            action: "update",
            post: post,
        });

        res.status(200).json({
            message: "update success!",
            post: result,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 404;
        }
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.creator.toString() !== req.userId) {
            const error = new Error("No authorized!");
            error.statusCode = 403;
            throw error;
        }

        if (post) {
            await deleteImage(post.imageUrl);
            await Post.findOneAndDelete({ _id: req.params.id });
        }

        const user = await User.findById(req.userId);

        user.posts.pull(req.params.id);
        await user.save();

        const io = socket.getIO();
        io.emit("posts", {
            action: "delete",
            post: post._id,
        });

        res.status(200).json({
            message: "Delete success!",
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 404;
        }
        next(err);
    }
};

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        res.status(200).json({
            userStatus: user.status,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 404;
        }
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.query.user);

        user.status = req.body.updateStatus;
        await user.save();

        res.status(200).json({
            status: user.status,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 404;
        }
        next(err);
    }
};

const deleteImage = (imageUrl) => {
    const imagePath = path.join(__dirname, "..", imageUrl);

    return new Promise((resolve, reject) => {
        fs.unlink(imagePath, (err) => {
            if (err) {
                throw err;
                resolve();
            } else {
                resolve();
            }
        });
    });
};
