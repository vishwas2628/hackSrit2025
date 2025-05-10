// backend/src/models/userModel.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// Predefined education levels with progress percentages
const educationLevels = {
  "High School": 20,
  "Associate's Degree": 40,
  "Bachelor's Degree": 60,
  "Master's Degree": 80,
  PhD: 100,
  Other: 10,
};

// Schema for career inputs
const userInputSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v && v.length > 0,
        message: "Skills must be a non-empty array",
      },
    },
    interests: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v && v.length > 0,
        message: "Interests must be a non-empty array",
      },
    },
    budget: {
      type: Number,
      required: true,
      min: [0, "Budget cannot be negative"],
    },
    recommendations: [
      {
        career: String,
        description: String,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

// Schema for users
const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email),
        message: "Please enter a valid email address",
      },
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    educationLevel: {
      type: String,
      enum: {
        values: Object.keys(educationLevels),
        message: "{VALUE} is not a valid education level",
      },
    },
    fields: {
      type: [String],
      default: undefined, // Explicitly set default to undefined
      validate: {
        // Allow undefined, null, or a non-empty array
        validator: (v) =>
          v === undefined || v === null || (Array.isArray(v) && v.length > 0),
        message: "Fields must be a non-empty array if provided",
      },
    },
    experience: {
      type: Number,
      min: [0, "Experience years cannot be negative"],
      default: 0,
    },
    birthDate: {
      type: Date,
      validate: {
        validator: (date) => !date || date < new Date(),
        message: "Birth date must be in the past",
      },
    },
    location: {
      type: new Schema(
        {
          city: { type: String, trim: true, required: false },
          state: { type: String, trim: true, required: false },
          country: { type: String, trim: true, required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    streetAddress: {
      type: String,
      trim: true,
      maxlength: [100, "Street address cannot exceed 100 characters"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property for age
userSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayOccurred =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  if (!hasBirthdayOccurred) age--;
  return age;
});

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

// Export models
export const UserInput = mongoose.model("UserInput", userInputSchema);
export const User = mongoose.model("User", userSchema);
