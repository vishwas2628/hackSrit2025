import React from 'react';

const Hero = () => {
  return (
    <div className="w-full mt-10 mb-5 flex items-center justify-center py-10 sm:py-0">
      <div className="text-center text-[#fff]">
        <h1 className="prata-regular text-4xl sm:text-5xl lg:text-6xl leading-snug">
          Discover your perfect<br />Career Path with AI
        </h1>
        <div className="flex flex-col items-center mt-8">
          <button className="text-white font-bold text-lg px-8 py-2 border-2 border-solid rounded-full hover:bg-gray-200 hover:text-black transition">
            JOIN US
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
