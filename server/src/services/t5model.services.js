import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Calculate the path to the Python script (2 levels up from current file)
const pythonScriptPath = path.join(__dirname, "../../flan_t5_model.py");

// /**
//  * Generate career recommendations using the T5 model via Python
//  * @param {Array} skills - Array of skills
//  * @param {Array} interests - Array of interests
//  * @param {Number} budget - Budget constraint
//  * @returns {Promise<Array>} - Array of career recommendations
//  */
export const generateCareerRecommendations = async (
  skills,
  interests,
  budget
) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Running Python script at: ${pythonScriptPath}`);

      // Spawn the Python process
      const pythonProcess = spawn("python", [pythonScriptPath]);

      // Set a timeout (30 seconds)
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error("T5 model execution timed out after 30 seconds"));
      }, 30000);

      // Handle process errors
      pythonProcess.on("error", (error) => {
        clearTimeout(timeout);
        console.error("Failed to start Python process:", error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Collect data from stdout
      let outputData = "";
      pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      // Collect errors from stderr
      let errorData = "";
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
        console.error(`Python stderr: ${data}`);
      });

      // Handle process completion
      pythonProcess.on("close", (code) => {
        clearTimeout(timeout);

        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error data: ${errorData}`);
          reject(
            new Error(`T5 model failed with exit code ${code}: ${errorData}`)
          );
          return;
        }

        try {
          // Parse the JSON output
          const recommendations = JSON.parse(outputData);

          // Validate the response format
          if (!Array.isArray(recommendations)) {
            reject(
              new Error("T5 model did not return an array of recommendations")
            );
            return;
          }

          // Verify each recommendation has the required structure
          const validRecommendations = recommendations.filter(
            (rec) =>
              rec &&
              typeof rec === "object" &&
              "career" in rec &&
              "description" in rec
          );

          if (validRecommendations.length === 0) {
            reject(new Error("T5 model returned no valid recommendations"));
            return;
          }

          resolve(validRecommendations);
        } catch (parseError) {
          console.error("Failed to parse T5 model output:", parseError);
          console.error("Raw output:", outputData);
          reject(
            new Error(`Failed to parse T5 model output: ${parseError.message}`)
          );
        }
      });

      // Send input to the Python process
      const inputData = {
        skills,
        interests,
        budget,
      };

      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();
    } catch (error) {
      console.error("Error in T5 model service:", error);
      reject(new Error(`T5 model service error: ${error.message}`));
    }
  });
};
