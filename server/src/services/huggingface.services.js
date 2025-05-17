// backend/src/services/huggingface.services.js
import fetch from "node-fetch";
import { ApiError } from "../utils/apiError.js";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY; // Store your API key in .env
const HUGGINGFACE_API_URL =
  "https://api-inference.huggingface.co/models/google/t5-v1_1-base";

const generateText = async (prompt) => {
  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          num_beams: 5,
          no_repeat_ngram_size: 2,
          early_stopping: true,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new ApiError(
        500,
        `Hugging Face API error: ${data.error || response.statusText}`
      );
    }

    // Return the generated text
    return data[0].generated_text;
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to generate text from Hugging Face API",
      error.message
    );
  }
};

/**
 * Get career recommendations based on user skills, interests, and budget
 * @param {Object} userData - User data including skills, interests, and budget
 * @param {Array<string>} userData.skills - Array of user's skills
 * @param {Array<string>} userData.interests - Array of user's interests
 * @param {number} userData.budget - User's budget for career development
 * @param {string} [userData.educationLevel] - User's education level
 * @param {number} [userData.experience] - User's years of experience
 * @returns {Promise<Array<Object>>} - Array of career recommendations with details
 */
const getCareerRecommendations = async (userData) => {
  try {
    // Validate required inputs
    if (!userData.skills || !userData.skills.length) {
      throw new ApiError(400, "Skills are required for career recommendations");
    }

    if (!userData.interests || !userData.interests.length) {
      throw new ApiError(
        400,
        "Interests are required for career recommendations"
      );
    }

    if (userData.budget === undefined || userData.budget === null) {
      throw new ApiError(400, "Budget is required for career recommendations");
    }

    // Create a structured prompt for the model
    const prompt = `Given the following information about a person:
Skills: ${userData.skills.join(", ")}
Interests: ${userData.interests.join(", ")}
Budget: $${userData.budget}
${userData.educationLevel ? `Education Level: ${userData.educationLevel}` : ""}
${
  userData.experience !== undefined
    ? `Experience: ${userData.experience} years`
    : ""
}

Recommend 3 suitable career paths with the following details for each:
1. Career title
2. Short description
3. Required skills
4. Potential salary range
5. Education requirements

Format as JSON: [{"career": "title", "description": "desc", "skills": ["skill1", "skill2"], "salary": "range", "education": "requirements"}]`;

    // Use the generateText function to get AI-generated recommendations
    const response = await generateText(prompt);

    // Parse the response - it should be JSON formatted text
    let recommendations = [];
    try {
      // Look for JSON in the response - find anything between square brackets
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON format is found, create a simple structure with the text
        recommendations = [
          {
            career: "General Recommendation",
            description: response.trim(),
          },
        ];
      }
    } catch (parseError) {
      console.error("Failed to parse recommendations:", parseError);
      // Return a simple structure with the raw text if parsing fails
      recommendations = [
        {
          career: "General Recommendation",
          description: response.trim(),
        },
      ];
    }

    return recommendations;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Failed to generate career recommendations",
      error.message
    );
  }
};

// Add an alias for the misspelled function name for backward compatibility
const getCareerRecomendations = getCareerRecommendations;

export { generateText, getCareerRecommendations, getCareerRecomendations };
