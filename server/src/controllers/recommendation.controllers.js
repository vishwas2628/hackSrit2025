// backend/src/controllers/recommendationController.js
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { generateCareerRecommendations } from "../services/t5model.services.js";

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { skills, interests, budget } = req.body;

    // Validate input
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new ApiError(400, "Skills must be a non-empty array");
    }
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      throw new ApiError(400, "Interests must be a non-empty array");
    }
    if (typeof budget !== "number" || budget < 0) {
      throw new ApiError(400, "Budget must be a non-negative number");
    }

    // Log the request details
    console.log(`Generating recommendations for user ${userId} with:
    - Skills: ${skills.join(', ')}
    - Interests: ${interests.join(', ')}
    - Budget: ${budget}`);

    // Call T5 model service to generate recommendations
    let recommendations;
    try {
      // The T5 model service already returns parsed JSON, no need for additional parsing
      recommendations = await generateCareerRecommendations(skills, interests, budget);
      
      console.log(`Received ${recommendations.length} recommendations from T5 model`);
    } catch (modelError) {
      console.error("T5 model error:", modelError);
      throw new ApiError(
        500,
        `T5 model failed to generate recommendations: ${modelError.message}`
      );
    }

    // Update the user's document with skills, interests, budget, and recommendations
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.skills = skills;
    user.interests = interests;
    user.budget = budget;
    user.recommendations = recommendations;

    await user.save();

    // Send response
    res.json({ careers: recommendations });
    console.log(`Successfully sent recommendations to user ${userId}`);
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    
    // Structured error handling
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ 
        error: error.message,
        success: false 
      });
    }
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    let errorMessage = "Failed to fetch recommendations";
    
    if (error.message.includes("timeout")) {
      statusCode = 504; // Gateway Timeout
      errorMessage = "Model processing timed out. Please try again.";
    } else if (error.message.includes("parse")) {
      statusCode = 500;
      errorMessage = "Failed to process model output.";
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: error.message,
      success: false
    });
  }
};

export { getRecommendations };
