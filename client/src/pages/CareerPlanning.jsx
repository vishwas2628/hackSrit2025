import React from 'react';
import CareerForm from '../components/CareerForm';

const CareerPlanning = () => {
  return (
    <div className="min-h-screen bg-blue-950 pt-8 pb-16">
      <div className="container mx-auto">
        <div className="mb-8 px-6">
          <h1 className="text-3xl sm:text-4xl text-white font-bold text-center mb-4">
            Career Path Planning
          </h1>
          <p className="text-blue-200 text-center max-w-3xl mx-auto">
            Plan your future career path with our AI-powered recommendation system. Answer a few questions and we'll provide a personalized career progression map.
          </p>
        </div>
        
        <CareerForm />
      </div>
    </div>
  );
};

export default CareerPlanning;

