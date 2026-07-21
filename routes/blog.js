const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const { checkOwnership } = require("../middlewares/auth");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Add Blog Page
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// =======================
// Edit Blog Page
// =======================
router.get("/edit/:id", checkOwnership, async (req, res) => {
  return res.render("editBlog", {
    user: req.user,
    blog: req.blog,
  });
});

// =======================
// Update Blog
// =======================
router.post("/edit/:id", checkOwnership, async (req, res) => {
  const { title, body } = req.body;

  await Blog.findByIdAndUpdate(req.params.id, {
    title,
    body,
  });

  return res.redirect(`/blog/${req.params.id}`);
});

// =======================
// Delete Blog
// =======================
router.post("/delete/:id", checkOwnership, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);

  return res.redirect("/");
});

// =======================
// View Blog
// =======================
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");

  const comments = await Comment.find({
    blogId: req.params.id,
  }).populate("createdBy");

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

// =======================
// Add Comment
// =======================
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  return res.redirect(`/blog/${req.params.blogId}`);
});

// =======================
// Create Blog
// =======================
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });

  return res.redirect(`/blog/${blog._id}`);
});

module.exports = router;