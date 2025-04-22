const { createHmac, randomBytes } = require("node:crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImagrURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password and create a salt
userSchema.pre("save", function (next) {
  const user = this;

  // Check if password is modified before hashing
  if (!user.isModified("password")) return next();

  // Generate salt and hashed password
  const salt = randomBytes(16).toString(); // Ensure salt is generated in hex format
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  // Assign salt and hashed password to the user
  user.salt = salt;
  user.password = hashedPassword;

  console.log("Salt:", salt); // Log salt for debugging
  console.log("Hashed Password:", hashedPassword); // Log hashed password for debugging

  next();
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("user not found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvieHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword != userProvieHash) throw new Error("incorrecr Password");

    const token = createTokenForUser(user);
    return token;
  }
);

const User = model("user", userSchema);

module.exports = User;
