import { UserInput } from "../models/userModel.js";
import { getCareerRecomendations } from "../services/huggingface.services.js";
import { ApiError } from "../utils/apiError.js";

const submitPrompt = async (req, res) => {
  try {
    const { skills, interests, budget } = req.body;

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
      throw new ApiError(500, [
        "Invalid Recommendations recieved from service",
      ]);
    }

    const userInput = new UserInput({
      skills,
      interests,
      budget,
    });
    await userInput.save();
    res.json({ careers: recommendations });
  } catch (error) {
    console.error("Error processing prompt:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to process prompt" });
  }
};

/**
 * Get all user inputs with pagination support
 */
const getAllInputs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(400, ["Invalid pagination parameters"]);
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await UserInput.countDocuments();

    // Get paginated results
    const inputs = await UserInput.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-recommendations"); // Exclude large recommendation data

    // Send response with pagination metadata
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
