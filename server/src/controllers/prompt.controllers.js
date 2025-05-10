import { CareerRecommendation } from "../models/careerRecommendation.js";
import { getCareerRecomendations } from "../services/huggingface.services.js"; // Fixed spelling and file name
import { ApiError } from "../utils/apiError.js";

const submitPrompt = async (req, res) => {
  try {
    const { skills, interests, budget } = req.body;

    // Validate inputs
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new ApiError(400, "Skills are required and must be an array");
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      throw new ApiError(400, "Interests are required and must be an array");
    }

    if (budget === undefined || budget === null || isNaN(Number(budget))) {
      throw new ApiError(400, "Budget is required and must be a number");
    }

    const recommendations = await getCareerRecomendations(
      skills,
      interests,
      Number(budget)
    );

    if (!recommendations || !Array.isArray(recommendations)) {
      throw new ApiError(500, "Invalid recommendations received from service");
    }

    // Save to CareerRecommendation
    const careerRec = new CareerRecommendation({
      skills,
      interests,
      budget,
      recommendations, // Add recommendations to the document
    });
    await careerRec.save();

    res.json({ careers: recommendations });
  } catch (error) {
    console.error("Error processing prompt:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to process prompt" });
  }
};

const getAllInputs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;
    const total = await CareerRecommendation.countDocuments();
    const inputs = await CareerRecommendation.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-recommendations");

    res.json({
      success: true,
      data: inputs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inputs:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch inputs" });
  }
};

export { submitPrompt, getAllInputs };
