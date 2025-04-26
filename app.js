const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

require("dotenv").config(); // This line will load the .env file and environment variables

const BLog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const Blog = require("./models/blog");

// Initialize an Express application instance
const app = express();

// Use environment variables for the port and MongoDB URI
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB using the URI from .env file
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Set EJS as the template/view engine for rendering dynamic HTML pages
app.set("view engine", "ejs");

// Set the directory path where the EJS templates (views) are stored
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

// Middleware to make currentPath available in all views
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Start the Express server and listen for incoming requests on the specified PORT
app.listen(PORT, () => console.log(`Server started at ${PORT}`));
