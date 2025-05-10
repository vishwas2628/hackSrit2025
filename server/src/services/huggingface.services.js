import axios from "axios";
import { json } from "express";
const careerMap = {
  tech: [
    {
      career: "Software Engineer",
      description: "Build innovative apps and systems.",
    },
    {
      career: "Data Scientist",
      description: "Analyze data to uncover insights.",
    },
    {
      career: "Cybersecurity Analyst",
      description: "Protect systems from threats.",
    },
  ],
  healthcare: [
    { career: "Doctor", description: "Diagnose and treat patients." },
    { career: "Nurse", description: "Provide patient care and support." },
    {
      career: "Medical Researcher",
      description: "Advance medical knowledge through research.",
    },
  ],
  education: [
    { career: "Teacher", description: "Educate and inspire students." },
    {
      career: "School Counselor",
      description: "Support student development.",
    },
    {
      career: "Educational Consultant",
      description: "Design learning programs.",
    },
  ],
  arts: [
    {
      career: "Dancer",
      description: "Perform and express through movement.",
    },
    {
      career: "Artist",
      description: "Create visual art in various mediums.",
    },
    { career: "Musician", description: "Compose or perform music." },
  ],
  engineering: [
    {
      career: "Civil Engineer",
      description: "Design infrastructure like bridges and roads.",
    },
    {
      career: "Mechanical Engineer",
      description: "Develop mechanical systems.",
    },
    {
      career: "Electrical Engineer",
      description: "Work on electrical systems and innovations.",
    },
  ],
  business: [
    {
      career: "Entrepreneur",
      description: "Start and grow your own business.",
    },
    {
      career: "Marketing Manager",
      description: "Lead marketing strategies.",
    },
    {
      career: "Financial Analyst",
      description: "Analyze financial data for decisions.",
    },
  ],
  // Default for unmatched interests
  default: [
    {
      career: "Freelancer",
      description: "Work independently in your field of interest.",
    },
    {
      career: "Consultant",
      description: "Provide expert advice in your area of expertise.",
    },
    {
      career: "Content Creator",
      description: "Share your passion through media.",
    },
  ],
};

const getCareerRecomendations = async (skills, interests, budget) => {
  // Handle array inputs properly
  const skillsStr = Array.isArray(skills) ? skills.join(", ") : skills;
  const interestsStr = Array.isArray(interests)
    ? interests.join(", ")
    : interests;

  // Convert to lowercase for case-insensitive matching
  const userInterest = Array.isArray(interests)
    ? interests.map((i) => i.toLowerCase())
    : typeof interests === "string"
    ? interests.toLowerCase()
    : "";

  // Determine career category based on interests
  let careerCategory = "default";

  // Check if userInterest is an array and handle accordingly
  const hasInterest = (keyword) => {
    if (Array.isArray(userInterest)) {
      return userInterest.some((i) => i.includes(keyword));
    } else if (typeof userInterest === "string") {
      return userInterest.includes(keyword);
    }
    return false;
  };

  // Match interests to categories
  if (hasInterest("tech") || hasInterest("software")) {
    careerCategory = "tech";
  } else if (
    hasInterest("health") ||
    hasInterest("medicine") ||
    hasInterest("healthcare")
  ) {
    careerCategory = "healthcare";
  } else if (hasInterest("education") || hasInterest("teaching")) {
    careerCategory = "education";
  } else if (
    hasInterest("art") ||
    hasInterest("dance") ||
    hasInterest("music")
  ) {
    careerCategory = "arts";
  } else if (
    hasInterest("engineer") ||
    hasInterest("mechanical") ||
    hasInterest("civil")
  ) {
    careerCategory = "engineering";
  } else if (hasInterest("business") || hasInterest("marketing")) {
    careerCategory = "business";
  }

  try {
    // Get careers based on the determined category
    const recommendedCareers = careerMap[careerCategory] || careerMap.default;
    // Create enhanced career descriptions
    const enhancedCareers = recommendedCareers.map((career) => {
      return {
        career: career.career,
        description: `${career.description} With your skills in ${skillsStr}, you can excel in this field while pursuing your interest in ${interestsStr}. Budget of $${budget} can cover initial training or tools.`,
      };
    });
    return enhancedCareers;
    // Future API implementation
    // const prompt = `Suggest 3 career paths for someone with skills in ${skillsStr} and an interest in ${interestsStr} with a budget of $${budget}.`;
    // try {
    //   const response = await axios.post(
    //     "https://api-inference.huggingface.co/models/t5-base",
    //     { inputs: prompt },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    //   return JSON.parse(response.data[0].generated_text);
    // } catch (error) {
    //   console.error("Hugging face API error:", error.message);
    //   return enhancedCareers; // Fall back to our predefined careers
    // }
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    // Return a default recommendation if everything fails
    return [
      {
        career: "Career Consultant",
        description:
          "Consider speaking with a career counselor to explore options matching your unique skills and interests.",
      },
      {
        career: "Freelancer",
        description: `Use your skills in ${skillsStr} to provide freelance services while exploring long-term career options.`,
      },
      {
        career: "Online Course Creator",
        description: `Share your knowledge of ${skillsStr} by creating and selling online courses.`,
      },
    ];
  }
};
export { getCareerRecomendations };
