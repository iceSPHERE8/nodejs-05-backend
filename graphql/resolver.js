const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

module.exports = {
    createUser: async ({ userInput }, req) => {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: "E-mail is invalid!" });
        }

        if (
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })
        ) {
            errors.push({ message: "Password is invalid!" });
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input!");
            error.data = errors;
            error.statusCode = 422;
            throw error;
        }

        const existedUser = await User.findOne({ email: userInput.email });
        if (existedUser) {
            const error = new Error("User already existed!");
            throw error;
        }

        const hashedPw = await bcrypt.hash(userInput.password, 12);

        const user = new User({
            username: userInput.username,
            email: userInput.email,
            password: hashedPw,
        });

        const createdUser = await user.save();

        // const { password, ...safeUser } = createdUser._doc;

        return { ...createdUser, _id: createdUser._id.toString() };
    },

    login: async ({ email, password }, req) => {
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error("User doesn't exist!");
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error("Password isn't correct!");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                username: user.username,
                email: user.email,
            },
            "1mS6A#h1hqvTKbfSi8pZATO(Wgm+l$xC",
            {
                expiresIn: "1h",
            }
        );

        return { token: token, userId: user._id.toString() };
    },

    createPost: async ({ postInput }, context) => {
        if (!context.isAuth) {
            const error = new Error("No authenticated!");
            error.statusCode = 401;
            throw error;
        }
        const errors = [];

        if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 2 })
        ) {
            errors.push({ message: "Invalid title!" });
        }

        if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5, max: 140 })
        ) {
            errors.push({ message: "Invalid content!" });
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input!");
            error.data = errors;
            error.statusCode = 422;
            throw error;
        }

        const user = await User.findById(context.userId);

        if (!user) {
            const error = new Error("Invalid user!");
            error.statusCode = 401;
            throw error;
        }

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: `/${postInput.imageUrl.replaceAll("\\", "/")}`,
            creator: user,
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();

        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
        };
    },

    fetchAllPosts: async ({ page }) => {
        if (!page) {
            page = 1;
        }
        const perpage = 2;

        const posts = await Post.find()
            .skip((page - 1) * perpage)
            .limit(perpage)
            .populate("creator");
        const total = await Post.find().countDocuments();

        return {
            posts: posts.map((p) => ({
                ...p._doc,
                _id: p._id.toString(),
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            })),
            total: Math.ceil(total / perpage),
        };
    },

    fetchOnePost: async ({ postId }) => {
        const post = await Post.findById(postId).populate("creator");

        if (!post) {
            const error = new Error("No post found!");
            error.statusCode = 422;
            throw error;
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        };
    },
};
