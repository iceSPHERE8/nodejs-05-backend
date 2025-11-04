const express = require("express");
const { body } = require("express-validator");

const authCtroller = require("../controller/auth");
const User = require("../models/user");

const router = express.Router();

router.put(
    "/signup",
    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((userDoc) => {
                    if (userDoc) {
                        return new Promise.reject("Email has been existed");
                    }
                });
            })
            .normalizeEmail(),
        body("password")
            .trim()
            .isLength({ min: 6 }),
        body("username")
            .trim()
            .notEmpty()
    ],
    authCtroller.signup
);

module.exports = router;
