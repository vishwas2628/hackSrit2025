// Service for handling API requests to the backend
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
  getCareerRecommendations: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/career-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching career recommendations:", error);

      // For testing/development - return mock data if API fails
      return {
        career_predictions: {
          year_1: {
            focus: "Skill Enhancement",
            recommendations: [
              {
                area: "Web Development",
                details:
                  "Strengthen skills in React, Django, and APIs. Work on personal projects or internships.",
              },
              {
                area: "Problem Solving",
                details:
                  "Participate in coding contests (LeetCode, Codeforces) and solve advanced DSA problems.",
              },
            ],
          },
          year_2: {
            focus: "Practical Exposure",
            recommendations: [
              {
                area: "Full-Time Internship",
                details:
                  "Target companies offering roles aligned with your skills and build network connections on LinkedIn.",
              },
              {
                area: "Open Source Contribution",
                details:
                  "Contribute to projects relevant to software development to showcase your skills.",
              },
            ],
          },
          year_3: {
            focus: "Career Entry",
            recommendations: [
              {
                area: "Job Placement",
                details:
                  "Apply for entry-level roles through campus placements or job portals.",
              },
              {
                area: "Freelancing",
                details:
                  "Take up freelance projects to gain additional income and industry exposure.",
              },
            ],
          },
          year_4: {
            focus: "Specialization and Growth",
            recommendations: [
              {
                area: "Advanced Development",
                details:
                  "Specialize in fields aligned with your interests, depending on market trends.",
              },
              {
                area: "Higher Responsibility Roles",
                details:
                  "Aim for team lead roles or technical specialist positions in reputable companies.",
              },
            ],
          },
        },
      };
    }
  },
};

export default ApiService;
