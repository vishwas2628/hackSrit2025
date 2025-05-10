import { error } from "console";
import { UserInput } from "../models/userModel.js";
import { getCareerRecomendations } from "../services/huggingface.services.js";
import { ApiError } from "../utils/apiError.js";
import spawn from "child_process";

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
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

    const pythonProcess = spawn("python3", ["flan_t5_model.py"]);

    const inputData = JSON.stringify({ skills, interests, budget });
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    let outputData = "";
    let errorData = "";

    //Collect output from python script

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorData);
        return res.status(500).json({
          error: "Failed to generate recommendations",
          details: errorData,
        });
      }
    });

    let recommendation;
    try {
      recommendation = JSON.parse(outputData);
    } catch (parseError) {
      console.error("Error parsing Python outpsut: ", parseError);
      return res.status(500).json({
        error: "Failed to parse recommendations",
        details: parseError.message,
      });
    }
    const userInput = new UserInput({
      userId,
      skills,
      interests,
      budget,
      recommendation,
    });
    await userInput.save();

    res.json({ careers: recommendation });
  } catch (error) {
    console.error("Error processing recommendation:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to process recommendation" });
  }
};

export { getRecommendations };
