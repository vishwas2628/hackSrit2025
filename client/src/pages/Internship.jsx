import React, { useState, useEffect } from "react";
import assets from "../assets/assets.js";

// Sample Card2 component with animations (replace with your actual Card2 if different)
const Card2 = ({ company, title, skills, location }) => {
  const skillWords = ["Skills", "Tools", "Tech", "Expertise"];
  const [currentSkill, setCurrentSkill] = useState(skillWords[0]);

  // Shuffling effect for skills label
  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      setCurrentSkill((prev) => {
        const currentIndex = skillWords.indexOf(prev);
        return skillWords[(currentIndex + 1) % skillWords.length];
      });
    }, 1500); // Change word every 1.5 seconds

    return () => clearInterval(shuffleInterval);
  }, [skillWords]);

  return (
    <div className="bg-blue-900/80 shadow-[0_4px_15px_rgba(59,130,246,0.4)] p-6 rounded-xl border-2 border-blue-400 hover:scale-105 hover:border-blue-300 hover:bg-blue-800/90 transition-all duration-300 animate-fade animate-slide-up animate-ease-out animate-duration-500 dark:bg-gray-900 dark:border-blue-500 dark:hover:bg-blue-700/90 dark:hover:border-blue-400 cursor-pointer">
      <h3 className="text-xl font-serif font-bold text-white dark:text-white">
        {company}
      </h3>
      <p className="text-sm text-blue-200 mt-2 dark:text-blue-300">{title}</p>
      <p className="text-sm text-blue-200 mt-2 dark:text-blue-300">
        <span className="inline-block transition-all duration-300 hover:skew-x-12 hover:text-blue-100">
          {currentSkill}:
        </span>{" "}
        {skills}
      </p>
      <p className="text-sm text-blue-200 mt-2 dark:text-blue-300">
        Location: {location}
      </p>
    </div>
  );
};

const Internship = () => {
  return (
    <div className="w-full min-h-screen py-12 sm:py-16 flex items-center justify-center bg-blue-800 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white text-center mb-12 dark:text-white animate-fade animate-slide-down animate-ease-out animate-duration-500">
          Explore Internship Opportunities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.inter.map((inter, index) => (
            <Card2
              key={index} // Use index as key; replace with unique ID if available
              company={inter[0]} // Fixed from index[0] to inter[0]
              title={inter[1]}
              skills={inter[2]}
              location={inter[3]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Internship;
