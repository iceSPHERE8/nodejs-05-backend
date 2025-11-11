const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
    createUser: async ({ userInput }, req) => {
        const errors = [];
        if(!validator.isEmail(userInput.email)) {
            errors.push({ message: "E-mail is invalid!" });
        }

        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })){
            errors.push({ message: "Password is invalid!" });
        }

        if(errors.length > 0) {
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

        return { ...createdUser._doc, _id: createdUser._id.toString() };
    },
};
