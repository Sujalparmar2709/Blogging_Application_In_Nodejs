const { Router } = require("express");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");

const router = Router();

// Sign In Page
router.get("/signin", (req, res) => {
  return res.render("signin");
});

// Sign Up Page
router.get("/signup", (req, res) => {
  return res.render("signup");
});

// Sign Up
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.render("signup", {
      error: "Email already exists",
    });
  }

  await User.create({
    fullName,
    email,
    password,
  });

  return res.redirect("/user/signin");
});

// Sign In
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.matchPasswordAndGenerateToken(email, password);

    return res
      .cookie("token", user)
      .redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
});

module.exports = router;