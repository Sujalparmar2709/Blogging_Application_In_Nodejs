const Blog = require("../models/blog");

async function checkOwnership(req, res, next) {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).send("Blog not found");
    }

    if (blog.createdBy.toString() !== req.user._id) {
        return res.status(403).send("Access Denied");
    }

    req.blog = blog;

    next();
}

module.exports = {
    checkOwnership,
};