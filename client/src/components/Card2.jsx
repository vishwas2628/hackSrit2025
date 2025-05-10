import React from "react";

const card2 = ({company,title,skills,location}) => {
  return (
    <a href="/job-details" className="block max-w-sm bg-[#1e1e2e] text-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
            <i className="fas fa-building text-lg"></i>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">{company}</h4>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-500">
          <i className="far fa-heart"></i>
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-400 mt-2">
          {skills}
        </p>
      </div>
      <div className="mt-4">
        <span className="inline-block bg-blue-600 text-sm text-white px-3 py-1 rounded-full">
          {location}
        </span>
      </div>
    </a>
  );
};

export default card2;