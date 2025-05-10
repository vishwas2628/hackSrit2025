import React from "react";

const Card1 = ({ name, img, text }) => {
  return (
    <div className="block max-w-sm bg-[#1e1e2e] text-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
          <img src={img} alt={name} className="w-full h-full object-cover" />
        </div>
        <h4 className="text-md font-medium text-gray-400">{name}</h4>
      </div>
      <div>
        <p className="text-sm text-gray-400 mt-2">{text}</p>
      </div>
      <div className="mt-4">
        <span className="text-sm text-gray-500 italic">- {name}</span>
      </div>
    </div>
  );
};

export default Card1;