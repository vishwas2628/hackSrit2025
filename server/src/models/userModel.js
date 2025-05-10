import { mongoose, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    // Authentication fields
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [4, "Username must be at least 4 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in query results by default
    },
    // Personal information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    birthDate: {
      type: Date,
      validate: {
        validator: function (date) {
          // Check if birth date is in the past
          return date < new Date();
        },
        message: "Birth date must be in the past",
      },
    },
    // Location information
    location: {
      type: new Schema(
        {
          city: {
            type: String,
            trim: true,
          },
          state: {
            type: String,
            trim: true,
          },
          country: {
            type: String,
            trim: true,
          },
        },
        { _id: false }
      ), // Don't create _id for subdocument
      required: [true, "Location is required"],
      validate: {
        validator: function (loc) {
          return (
            loc &&
            typeof loc === "object" &&
            loc.country &&
            loc.country.trim().length > 0
          );
        },
        message: "Location must include a country",
      },
    },
    streetAddress: {
      type: String,
      trim: true,
    },
    // Education and professional information
    educationLevel: {
      type: String,
      enum: {
        values: [
          "High School",
          "Associate's Degree",
          "Bachelor's Degree",
          "Master's Degree",
          "PhD",
          "Other",
        ],
        message: "{VALUE} is not a valid education level",
      },
    },
    currentField: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: [0, "Experience years cannot be negative"],
      default: 0,
    },
    // Career planning data
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Skills must be a non-empty array",
      },
    },
    interests: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
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
        _id: false, // Don't create _id for subdocument items
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for searchable fields
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({
  "location.country": 1,
  "location.state": 1,
  "location.city": 1,
});
userSchema.index({ skills: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ currentField: 1 });

// Virtual property to calculate age from birthDate
userSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;

  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust age if birthday hasn't occurred yet this year
  const hasBirthdayOccurred =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasBirthdayOccurred) {
    age--;
  }

  return age;
});

// Pre-save middleware to validate password
userSchema.pre("validate", function (next) {
  // Only validate the password if it's new or modified
  if (!this.isModified("password")) return next();

  // Password validation regex
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

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// No additional location validation needed - validation is in the schema
// Define instance methods
userSchema.methods = {
  // Method to compare password
  comparePassword: async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  // Method to return safe user data without sensitive information
  getSafeUserData: function () {
    const userData = this.toObject({ virtuals: true });
    // Remove sensitive fields
    delete userData.password;
    delete userData.__v;
    delete userData.streetAddress;

    return userData;
  },
};

export const User = mongoose.model("User", userSchema);
