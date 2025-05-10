import logo from './FutureMap.png'
import logobg from './FutureMap-removebg-preview.png'
import login_background_dark from './login_background_dark-1.png'

const inter = [
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
    ["company","job tittle","required skillls kuhhgtg jhrgur uht","location"],
] 

const sampleJson = {
  obj1: { name: "Item 1", value: "Data 1" },
  obj2: { name: "Item 2", value: "Data 2" },
  obj3: { name: "Item 3", value: "Data 3" },
  obj4: { name: "Item 4", value: "Data 4" },
  obj5: { name: "Item 5", value: "Data 5" },
  obj6: { name: "Item 6", value: "Data 6" },
  obj7: { name: "Item 7", value: "Data 7" },
  obj8: { name: "Item 8", value: "Data 8" },
  obj9: { name: "Item 9", value: "Data 9" },
  obj10: { name: "Item 10", value: "Data 10" },
};

//sample json data 
const jsonData = {
  career_predictions: {
    year_1: {
      focus: "Skill Enhancement",
      recommendations: [
        {
          area: "Web Development",
          details: "Strengthen skills in React, Django, and APIs. Work on personal projects or internships.",
        },
        {
          area: "Problem Solving",
          details: "Participate in coding contests (LeetCode, Codeforces) and solve advanced DSA problems.",
        },
      ],
    },
    year_2: {
      focus: "Practical Exposure",
      recommendations: [
        {
          area: "Full-Time Internship",
          details: "Target companies offering Python/JavaScript roles and build network connections on LinkedIn.",
        },
        {
          area: "Open Source Contribution",
          details: "Contribute to projects relevant to software development to showcase your skills.",
        },
      ],
    },
    year_3: {
      focus: "Career Entry",
      recommendations: [
        {
          area: "Job Placement",
          details: "Apply for entry-level roles in software development through campus placements or job portals.",
        },
        {
          area: "Freelancing",
          details: "Take up freelance projects to gain additional income and industry exposure.",
        },
      ],
    },
    year_4: {
      focus: "Specialization and Growth",
      recommendations: [
        {
          area: "Advanced Development",
          details: "Specialize in fields like machine learning, cloud computing, or DevOps, depending on market trends.",
        },
        {
          area: "Higher Responsibility Roles",
          details: "Aim for team lead roles or technical specialist positions in reputable companies.",
        },
      ],
    },
  },
};

const assets = {
    logo,
    logobg,
    login_background_dark,
    inter,
    sampleJson,
    jsonData
}

export default assets