// backend/src/models/userModel.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define the user schema
const userSchema = new Schema(
  {
    // Authentication fields
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      validate: {
        validator: (username) => /^[a-zA-Z0-9_]+$/.test(username),
        message: "Username can only contain letters, numbers, and underscores",
      },
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email),
        message: "Invalid email address format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude password from query results by default
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
// Email index is already created by the 'unique: true' property in the schema
userSchema.index({
  "location.country": 1,
  "location.state": 1,
  "location.city": 1,
});
userSchema.index({ skills: 1 });
userSchema.index({ interests: 1 });

// Virtual property to calculate age from birthDate

// Password validation and hashing
userSchema.pre("validate", function (next) {
  if (!this.isModified("password")) return next();
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(this.password)) {
    this.invalidate(
      "password",
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods = {
  comparePassword: async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },
  getSafeUserData: function () {
    const userData = this.toObject({ virtuals: true });
    delete userData.password;
    delete userData.__v;
    return userData;
  },
};

// Export the User model
export const User = mongoose.model("User", userSchema);
