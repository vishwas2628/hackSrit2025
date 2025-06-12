import React, { useState, useEffect } from "react";

const Hero = () => {
  const words = ["Perfect", "Ideal", "Dream", "Ultimate"];
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      setIsShuffling(true);
      setTimeout(() => {
        setCurrentWord((prev) => {
          const currentIndex = words.indexOf(prev);
          return words[(currentIndex + 1) % words.length];
        });
        setIsShuffling(false);
      }, 300); // Duration of fade-out
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(shuffleInterval);
  }, [words]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 sm:py-16 bg-gradient-to-br from-blue-900 via-black to-blue-800 transition-all duration-1000 dark:bg-gray-950">
      <div className="text-center text-white px-6 sm:px-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-snug tracking-tight sm:leading-tight lg:leading-tight">
          Discover Your{" "}
          <span
            className={`inline-block transition-opacity duration-300 ${
              isShuffling ? "opacity-0" : "opacity-100"
            }`}
          >
            {currentWord}
          </span>
          <br />
          Career Path with AI
        </h1>
        <p className="mt-4 text-lg sm:text-xl lg:text-2xl font-light text-blue-200 dark:text-blue-300 max-w-2xl mx-auto">
          Unlock your potential, embrace innovation, and shape a future that
          inspires greatness.
        </p>
        <div className="flex justify-center mt-8">
          <a
            href="./career-planning"
            className="text-white cursor-pointer font-bold text-lg px-10 py-3 border-2 border-blue-400 rounded-full bg-blue-900/30 hover:bg-blue-700 hover:border-blue-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 dark:border-blue-500 dark:hover:bg-blue-600"
          >
            START NOW
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
