const User = require("../models/user");
const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");

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
        .then(hashedPw => {
            const user = User({
                email: email,
                username: username,
                password: hashedPw
            });

            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "User created!",
                userId: result._id
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
        });
};
