const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        return next(error);
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, "GksbFraEzy5+Btmaa@RALT98yirc##jH");
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
};
