const User = require("../models/user");
const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.satusCode = 422;
        error.data = errors.array();

        throw error;
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then((hashedPw) => {
            const user = User({
                email: email,
                username: username,
                password: hashedPw,
            });

            return user.save();
        })
        .then((result) => {
            res.status(201).json({
                message: "User created!",
                userId: result._id,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                const error = new Error("No such user found!");
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;

            return bcrypt.compare(password, user.password);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error("Wrong password!");
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString(),
                },
                "GksbFraEzy5+Btmaa@RALT98yirc##jH",
                { expiresIn: "1h" }
            );

            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString(),
                userStatus: loadedUser.status,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
