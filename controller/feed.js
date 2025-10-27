exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts:[{
            title: "POST",
            content: "CONTENT"
        }]
    });
}

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: "Post Has Been Created!",
        post: {
            title: title,
            content: content
        }
    })
}