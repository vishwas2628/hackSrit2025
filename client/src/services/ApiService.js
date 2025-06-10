const API_BASE_URL = "http://localhost:8001/api"; // Adjust this to your backend URL

export const ApiService = {
  /**
   * Get career recommendations based on user inputs
   * @param {Object} userData - User profile data
   * @param {Array} userData.skills - User's skills
   * @param {Array} userData.interests - User's interests
   * @param {String} userData.educationLevel - User's education level
   * @param {String} userData.budget - User's budget considerations
   * @returns {Promise} - Promise that resolves to career recommendations
   */
  /**
   * Transform Flan-T5 model output to the frontend's expected format
   * @param {Array} modelOutput - Array of career recommendations from the model
   * @returns {Object} - Transformed data in the format expected by the frontend
   */
  transformModelOutput: (modelOutput) => {
    // Validate that modelOutput is an array
    if (!Array.isArray(modelOutput)) {
      console.error("Model output is not an array:", modelOutput);
      return null;
    }

    // Create a 4-year career progression from the model's recommendations
    const transformed = {
      career_predictions: {
        year_1: {
          focus: "Skill Acquisition",
          recommendations: []
        },
        year_2: {
          focus: "Practical Experience",
          recommendations: []
        },
        year_3: {
          focus: "Career Development",
          recommendations: []
        },
        year_4: {
          focus: "Advanced Specialization",
          recommendations: []
        }
      }
    };

    // Process each career recommendation
    modelOutput.forEach((career, index) => {
      // Basic validation of career object
      if (!career || typeof career !== 'object' || !career.career || !career.description) {
        console.warn("Invalid career object:", career);
        return; // Skip this career
      }

      // Determine which year to add this career to
      const yearKey = `year_${index + 1}`;
      
      // Add skill acquisition recommendations for year 1
      if (yearKey === 'year_1') {
        transformed.career_predictions.year_1.recommendations.push({
          area: "Foundation Skills",
          details: `Develop key skills in ${career.career}: ${career.skill_match}`
        });
        transformed.career_predictions.year_1.recommendations.push({
          area: "Education Planning",
          details: `${career.budget_fit}`
        });
      }
      
      // Add practical experience recommendations for year 2
      else if (yearKey === 'year_2') {
        transformed.career_predictions.year_2.recommendations.push({
          area: career.career,
          details: career.description
        });
        transformed.career_predictions.year_2.recommendations.push({
          area: "Skill Application",
          details: `Apply your ${career.skill_match.split(' ').slice(-3).join(' ')} skills through internships or project work.`
        });
      }
      
      // Add career development recommendations for year 3
      else if (yearKey === 'year_3') {
        transformed.career_predictions.year_3.recommendations.push({
          area: career.career,
          details: career.description
        });
        transformed.career_predictions.year_3.recommendations.push({
          area: "Professional Growth",
          details: `Build on your experience in ${career.career} by seeking certifications and advanced training.`
        });
      }
    });

    // Add generic recommendations for year 4 if we have fewer than 3 careers
    if (modelOutput.length < 3) {
      transformed.career_predictions.year_4.recommendations.push({
        area: "Continued Learning",
        details: "Stay updated with industry trends and continuously enhance your skills through workshops and courses."
      });
      transformed.career_predictions.year_4.recommendations.push({
        area: "Leadership Development",
        details: "Consider pursuing leadership roles or specializing further in your chosen career path."
      });
    } else if (modelOutput[2]) {
      // Use the third career for year 4 if available
      transformed.career_predictions.year_4.recommendations.push({
        area: modelOutput[2].career,
        details: modelOutput[2].description
      });
      transformed.career_predictions.year_4.recommendations.push({
        area: "Advanced Expertise",
        details: `Become an expert in ${modelOutput[2].career} by ${modelOutput[2].skill_match.includes('apply') ? modelOutput[2].skill_match : 'applying your skills to complex problems'}.`
      });
    }

    return transformed;
  },

  getCareerRecommendations: async (userData) => {
    try {
      // Convert budget string to number if needed
      if (userData.budget && typeof userData.budget === 'string') {
        // Extract the budget tier and convert to a reasonable number
        const budgetValue = (() => {
          if (userData.budget.includes('Limited')) return 1000;
          if (userData.budget.includes('Entry')) return 3000;
          if (userData.budget.includes('Moderate')) return 5000;
          if (userData.budget.includes('Substantial')) return 8000;
          if (userData.budget.includes('Flexible')) return 10000;
          return 5000; // Default
        })();
        
        userData = {
          ...userData,
          budget: budgetValue
        };
      }

      console.log("Sending career recommendation request:", userData);
      
      const response = await fetch(`${API_BASE_URL}/recommendation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add authentication token
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);
      
      // Check if the data has the expected structure
      if (data && data.careers && Array.isArray(data.careers)) {
        // Transform the model output to match the frontend's expected format
        const transformedData = ApiService.transformModelOutput(data.careers);
        console.log("Transformed data:", transformedData);
        return transformedData;
      } else {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching career recommendations:", error);

      // For testing/development - return mock data if API fails
      // This mock data now simulates the transformed output from our model
      return {
        career_predictions: {
          year_1: {
            focus: "Skill Acquisition",
            recommendations: [
              {
                area: "Foundation Skills",
                details: "Develop key skills related to your interests through online courses and training programs.",
              },
              {
                area: "Education Planning",
                details: "Allocate your budget effectively across essential certifications and learning resources.",
              },
            ],
          },
          year_2: {
            focus: "Practical Experience",
            recommendations: [
              {
                area: "Entry-Level Role",
                details: "Gain hands-on experience through internships or junior positions in your field of interest.",
              },
              {
                area: "Skill Application",
                details: "Apply your theoretical knowledge to real-world projects to build your portfolio.",
              },
            ],
          },
          year_3: {
            focus: "Career Development",
            recommendations: [
              {
                area: "Professional Growth",
                details: "Seek opportunities for advancement or specialization within your chosen career path.",
              },
              {
                area: "Network Building",
                details: "Expand your professional network through industry events and online communities.",
              },
            ],
          },
          year_4: {
            focus: "Advanced Specialization",
            recommendations: [
              {
                area: "Leadership Development",
                details: "Develop management and leadership skills to prepare for senior roles.",
              },
              {
                area: "Continued Learning",
                details: "Stay current with industry trends and technologies through advanced courses and certifications.",
              },
            ],
          },
        },
      };
    }
  },
};

export default ApiService;
