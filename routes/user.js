const { Router } = require("express");
const router = Router();

const User = require("../models/user"); // Adjust the path if necessary

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or password",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if a user with the same email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists — generate token and redirect to home with token
      const token = await User.matchPasswordAndGenerateToken(email, password);
      return res.cookie("token", token).redirect("/");
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    // Generate token for the newly created user
    const token = await User.matchPasswordAndGenerateToken(email, password);

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    console.error(error);
    return res.render("signup", {
      error: "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;
