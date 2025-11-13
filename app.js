const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const app = express();

const { createHandler } = require("graphql-http/lib/use/express");
const { renderGraphiQL } = require("@graphql-yoga/render-graphiql");
const schema = require("./graphql/schema");
const root = require("./graphql/resolver");

const { auth } = require("./middleware/auth");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json());
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
    if(!req.isAuth) {
        throw new Error("No authenticated!");
    }
    if (!req.file) {
        res.status(200).json({ message: "No file uploaded!" });
    }
    if (req.body.oldPath) {
        deleteImage(req.body.oldPath);
    }

    res.status(201).json({ message: "File stored!", filePath: req.file.path });
});

app.use(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: root,

        context: (req) => {
            return {
                isAuth: req.raw.isAuth,
                userId: req.raw.userId,
            };
        },

        formatError: (err) => {
            if (!err.originalError) {
                return {
                    message: err.message,
                    locations: err.locations,
                    path: err.path,
                };
            }
            const data = err.originalError.data;
            const message = err.message || "An error occurred!";
            const code = err.originalError.statusCode || 500;

            return {
                message: message,
                locations: err.locations,
                path: err.path,
                extensions: {
                    status: code,
                    data: data,
                },
            };
        },
    })
);

app.use("/graphiql", (req, res) => {
    res.send(
        renderGraphiQL({
            endpoint: "/graphql",
        })
    );
});

app.use((error, req, res, next) => {
    console.log(error);

    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(
        "mongodb+srv://fatony:hsYansE9PSyD2JIa@cluster0.lqa7wj7.mongodb.net/post?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then((result) => {
        app.listen(8080);
    })
    .catch((err) => console.log(err));

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
