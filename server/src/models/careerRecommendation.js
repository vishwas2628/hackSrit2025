import { mongoose, Schema } from "mongoose";

const careerRecommendationSchema = new Schema(
  {
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
  }
);

// Create indexes for searchable fields
careerRecommendationSchema.index({ skills: 1 });
careerRecommendationSchema.index({ interests: 1 });

export const CareerRecommendation = mongoose.model(
  "CareerRecommendation",
  careerRecommendationSchema
);
