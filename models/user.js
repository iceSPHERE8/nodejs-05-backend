const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "New user"
    },
    posts: [{
        type: Mongoose.Schema.ObjectId,
        ref: "Post"
    }]
});

module.exports = Mongoose.model("User", userSchema);