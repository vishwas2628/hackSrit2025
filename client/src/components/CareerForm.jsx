import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import FlowDiagram from './FlowDiagram';

// Career fields and their associated skills
const CAREER_FIELDS = [
  {
    id: 'technology',
    name: 'Technology & Computer Science',
    skills: [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Swift', 
      'React', 'Angular', 'Vue', 'Node.js', 'Django', 'AWS', 'Azure', 'Docker',
      'SQL', 'NoSQL', 'Data Analysis', 'Machine Learning', 'AI', 'DevOps', 
      'UI/UX Design', 'Cybersecurity', 'Blockchain', 'Cloud Computing'
    ]
  },
  {
    id: 'business',
    name: 'Business & Management',
    skills: [
      'Marketing', 'Sales', 'Financial Analysis', 'Accounting', 'Project Management', 
      'Business Analysis', 'Strategic Planning', 'Leadership', 'Communication', 
      'Negotiation', 'Customer Service', 'HR Management', 'Operations Management', 
      'Supply Chain', 'Business Development', 'Public Speaking', 'Risk Management'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    skills: [
      'Patient Care', 'Medical Terminology', 'Clinical Skills', 'Diagnostics', 
      'Pharmacology', 'Healthcare Administration', 'Electronic Medical Records', 
      'Medical Research', 'Anatomy', 'Physiology', 'Nutrition', 'Mental Health', 
      'First Aid', 'Public Health', 'Healthcare Policy', 'Medical Ethics'
    ]
  },
  {
    id: 'creative',
    name: 'Arts & Creative Fields',
    skills: [
      'Graphic Design', 'Photography', 'Illustration', 'Video Production', 'Animation', 
      'Music Production', 'Creative Writing', 'Copywriting', 'Content Creation', 
      'Art Direction', 'Fashion Design', 'Interior Design', 'Architecture', 
      'Game Design', 'Storyboarding', 'Web Design', 'Brand Development'
    ]
  },
  {
    id: 'education',
    name: 'Education & Teaching',
    skills: [
      'Curriculum Development', 'Lesson Planning', 'Educational Assessment', 
      'Classroom Management', 'Special Education', 'E-Learning', 'Adult Education', 
      'Early Childhood Education', 'Educational Psychology', 'Instructional Design', 
      'Educational Technology', 'Student Counseling', 'Academic Advising'
    ]
  },
  {
    id: 'science',
    name: 'Science & Research',
    skills: [
      'Laboratory Techniques', 'Research Methodology', 'Data Collection', 'Statistical Analysis', 
      'Scientific Writing', 'Experimental Design', 'Bioinformatics', 'Microscopy', 
      'Chromatography', 'Spectroscopy', 'Geology', 'Environmental Science', 
      'Physics Concepts', 'Chemistry Concepts', 'Biology Concepts', 'Astronomy'
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering & Manufacturing',
    skills: [
      'CAD Software', 'Mechanical Design', 'Electrical Systems', 'Civil Engineering', 
      'Structural Analysis', 'Control Systems', 'Robotics', 'Manufacturing Processes', 
      'Quality Control', 'Prototyping', 'Engineering Mathematics', 'Thermodynamics', 
      'Material Science', 'Process Optimization', 'Industrial Design'
    ]
  },
  {
    id: 'legal',
    name: 'Law & Legal',
    skills: [
      'Legal Research', 'Contract Law', 'Corporate Law', 'Intellectual Property', 
      'Regulatory Compliance', 'Legal Writing', 'Negotiation', 'Dispute Resolution', 
      'Legal Ethics', 'Case Management', 'Civil Procedure', 'Criminal Law', 
      'Constitutional Law', 'International Law', 'Environmental Law'
    ]
  },
  {
    id: 'trades',
    name: 'Trade & Vocational',
    skills: [
      'Electrical Wiring', 'Plumbing', 'HVAC', 'Carpentry', 'Welding', 'Automotive Repair', 
      'CNC Operation', 'Machining', 'Masonry', 'Roofing', 'Landscaping', 'Equipment Operation', 
      'Painting', 'Construction Management', 'Blueprint Reading', 'Safety Protocols'
    ]
  },
  {
    id: 'social',
    name: 'Social Services & Community',
    skills: [
      'Counseling', 'Case Management', 'Social Work', 'Community Organizing', 'Conflict Resolution', 
      'Program Development', 'Fundraising', 'Grant Writing', 'Advocacy', 'Crisis Intervention', 
      'Youth Development', 'Family Support', 'Cultural Competency', 'Social Policy'
    ]
  }
];

// Interest areas covering all major career fields
const INTEREST_AREAS = [
  // Technology
  'Software Development', 'Data Science', 'Cybersecurity', 'Web Development', 'Mobile Development',
  'AI/Machine Learning', 'UX/UI Design', 'IT Support', 'Cloud Computing', 'Game Development',
  
  // Business
  'Marketing', 'Finance', 'Entrepreneurship', 'Human Resources', 'Sales', 'Consulting',
  'Project Management', 'E-commerce', 'Real Estate', 'Investment Banking',
  
  // Healthcare
  'Medicine', 'Nursing', 'Public Health', 'Mental Health', 'Physical Therapy', 'Pharmacy',
  'Healthcare Administration', 'Medical Research', 'Dentistry', 'Veterinary Medicine',
  
  // Creative
  'Visual Arts', 'Performing Arts', 'Writing/Publishing', 'Film/Video Production', 'Animation',
  'Fashion', 'Interior Design', 'Architecture', 'Media Production', 'Culinary Arts',
  
  // Education
  'Teaching', 'Educational Administration', 'Educational Research', 'Academic Advising',
  'Special Education', 'Corporate Training', 'Educational Technology', 'Higher Education',
  
  // Science & Research
  'Academic Research', 'Laboratory Science', 'Field Research', 'Environmental Science',
  'Astronomy', 'Geology', 'Chemistry', 'Physics', 'Biology', 'Mathematics',
  
  // Engineering
  'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering',
  'Aerospace Engineering', 'Biomedical Engineering', 'Industrial Engineering', 'Computer Engineering',
  
  // Legal
  'Law Practice', 'Legal Research', 'Criminal Justice', 'Corporate Law', 'Intellectual Property',
  'International Law', 'Environmental Law', 'Human Rights', 'Family Law',
  
  // Trades & Vocational
  'Construction', 'Automotive', 'Electrical Work', 'Plumbing', 'Welding', 'Carpentry',
  'HVAC', 'Culinary Arts', 'Cosmetology', 'Manufacturing'
];

const EDUCATION_LEVELS = [
  'High School/GED', 
  'Some College',
  'Associate Degree', 
  'Bachelor\'s Degree', 
  'Master\'s Degree', 
  'PhD/Doctorate', 
  'Trade School/Vocational Training',
  'Professional Certification',
  'Self-taught', 
  'Currently in School'
];

const BUDGET_OPTIONS = [
  'Limited (No additional investment possible)',
  'Entry-level (Can invest in online courses/books)',
  'Moderate (Can afford certifications or bootcamps)',
  'Substantial (Can afford part-time education programs)',
  'Flexible (Can afford full degree programs or career changes)'
];

const CareerForm = () => {
  // Form steps
  const steps = ["Field Selection", "Skills", "Interests", "Education & Budget", "Review"];
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data state
  const [formData, setFormData] = useState({
    careerField: '',
    skills: [],
    interests: [],
    educationLevel: '',
    budget: ''
  });
  
  // Available skills based on selected field
  const [availableSkills, setAvailableSkills] = useState([]);
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Update available skills when career field changes
  useEffect(() => {
    if (formData.careerField) {
      const selectedField = CAREER_FIELDS.find(field => field.id === formData.careerField);
      if (selectedField) {
        setAvailableSkills(selectedField.skills);
        // Reset skills when field changes
        setFormData(prev => ({ ...prev, skills: [] }));
      }
    }
  }, [formData.careerField]);

  // Form change handlers
  const handleCareerFieldChange = (e) => {
    setFormData({ ...formData, careerField: e.target.value });
  };

  const handleCheckboxChange = (e, field) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prevState => {
      if (isChecked) {
        return { ...prevState, [field]: [...prevState[field], value] };
      } else {
        return { ...prevState, [field]: prevState[field].filter(item => item !== value) };
      }
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prevStep => Math.min(prevStep + 1, steps.length - 1));
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
    setError('');
  };

  // Form validation for each step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Field Selection
        if (!formData.careerField) {
          setError('Please select a career field');
          return false;
        }
        return true;
      
      case 1: // Skills
        if (formData.skills.length === 0) {
          setError('Please select at least one skill');
          return false;
        }
        return true;
      
      case 2: // Interests
        if (formData.interests.length === 0) {
          setError('Please select at least one interest');
          return false;
        }
        return true;
      
      case 3: // Education & Budget
        if (!formData.educationLevel) {
          setError('Please select your education level');
          return false;
        }
        if (!formData.budget) {
          setError('Please select your budget consideration');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.getCareerRecommendations(formData);
      setRecommendations(response);
      setFormSubmitted(true);
    } catch (error) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to start over
  const handleReset = () => {
    setRecommendations(null);
    setFormSubmitted(false);
    setCurrentStep(0);
    setFormData({
      careerField: '',
      skills: [],
      interests: [],
      educationLevel: '',
      budget: ''
    });
    setError('');
  };

  // Render career field selection step
  const renderFieldSelectionStep = () => (
    <div className="mb-6">
      <h3 className="text-xl text-white font-medium mb-4">Select Your Career Field:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAREER_FIELDS.map(field => (
          <div 
            key={field.id} 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.careerField === field.id 
                ? 'bg-blue-600/40 border-blue-400' 
                : 'bg-blue-900/20 border-blue-800 hover:bg-blue-800/30'
            }`}
            onClick={() => setFormData({ ...formData, careerField: field.id })}
          >
            <div className="flex items-start">
              <input
                type="radio"
                id={`field-${field.id}`}
                name="careerField"
                value={field.id}
                checked={formData.careerField === field.id}
                onChange={handleCareerFieldChange}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
              />
              <label htmlFor={`field-${field.id}`} className="ml-2 cursor-pointer">
                <div className="text-white font-medium">{field.name}</div>
                <div className="text-blue-200 text-sm mt-1">
                  {field.skills.slice(0, 3).join(', ')}
                  {field.skills.length > 3 ? '...' : ''}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render skills selection step
  const renderSkillsStep = () => (
    <div className="mb-6">
      <h3 className="text-xl text-white font-medium mb-4">Select Your Skills:</h3>
      <p className="text-blue-200 mb-4">
        Select the skills you possess in {CAREER_FIELDS.find(f => f.id === formData.careerField)?.name}:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {availableSkills.map(skill => (
          <div key={skill} className="flex items-center">
            <input
              type="checkbox"
              id={`skill-${skill.replace(/\s+/g, '-')}`}
              value={skill}
              checked={formData.skills.includes(skill)}
              onChange={(e) => handleCheckboxChange(e, 'skills')}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label 
              htmlFor={`skill-${skill.replace(/\s+/g, '-')}`} 
              className="ml-2 text-sm font-medium text-gray-300 cursor-pointer"
            >
              {skill}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // Render interests selection step
  const renderInterestsStep = () => (
    <div className="mb-6">
      <h3 className="text-xl text-white font-medium mb-4">Select Your Interests:</h3>
      <p className="text-blue-200 mb-4">
        Select areas that interest you (even if they're outside your current field):
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {INTEREST_AREAS.map(interest => (
          <div key={interest} className="flex items-center">
            <input
              type="checkbox"
              id={`interest-${interest.replace(/\s+/g, '-')}`}
              value={interest}
              checked={formData.interests.includes(interest)}
              onChange={(e) => handleCheckboxChange(e, 'interests')}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label 
              htmlFor={`interest-${interest.replace(/\s+/g, '-')}`} 
              className="ml-2 text-sm font-medium text-gray-300 cursor-pointer"
            >
              {interest}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // Render education and budget step
  const renderEducationBudgetStep = () => (
    <>
      <div className="mb-6">
        <h3 className="text-xl text-white font-medium mb-4">Education Level:</h3>
        <select
          name="educationLevel"
          value={formData.educationLevel}
          onChange={handleSelectChange}
          className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your current education level</option>
          {EDUCATION_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-xl text-white font-medium mb-4">Budget for Career Development:</h3>
        <div className="space-y-3">
          {BUDGET_OPTIONS.map(budget => (
            <div key={budget} className="flex items-center">
              <input
                type="radio"
                id={`budget-${budget.split(' ')[0].toLowerCase()}`}
                name="budget"
                value={budget}
                checked={formData.budget === budget}
                onChange={handleSelectChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
              />
              <label 
                htmlFor={`budget-${budget.split(' ')[0].toLowerCase()}`} 
                className="ml-2 text-gray-300"
              >
                {budget}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // Render review step
  const renderReviewStep = () => (
    <div className="mb-6">
      <h3 className="text-xl text-white font-medium mb-4">Review Your Information:</h3>
      
      <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium">Career Field:</h4>
        <p className="text-blue-200">
          {CAREER_FIELDS.find(f => f.id === formData.careerField)?.name}
        </p>
      </div>
      
      <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium">Skills:</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map(skill => (
            <span key={skill} className="bg-blue-800/60 text-blue-200 px-2 py-1 rounded text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium">Interests:</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.interests.map(interest => (
            <span key={interest} className="bg-blue-800/60 text-blue-200 px-2 py-1 rounded text-sm">
              {interest}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium">Education Level:</h4>
        <p className="text-blue-200">{formData.educationLevel}</p>
      </div>
      
      <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium">Budget Consideration:</h4>
        <p className="text-blue-200">{formData.budget}</p>
      </div>
    </div>
  );

  // Render progress steps
  const renderProgressSteps = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                index === currentStep 
                  ? 'bg-blue-500 text-white' 
                  : index < currentStep 
                    ? 'bg-blue-700 text-gray-300' 
                    : 'bg-gray-700 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs text-blue-300 hidden sm:block">{step}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700"></div>
        <div 
          className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Render form step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderFieldSelectionStep();
      case 1:
        return renderSkillsStep();
      case 2:
        return renderInterestsStep();
      case 3:
        return renderEducationBudgetStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderStepNavigation = () => (
    <div className="flex justify-between mt-8">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300"
        >
          Back
        </button>
      ) : (
        <div></div> // Empty div for spacing
      )}
      
      {currentStep === steps.length - 1 ? (
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 text-white font-medium rounded-lg ${
            loading 
              ? 'bg-blue-700/50 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 focus:ring-4 focus:ring-blue-800'
          } transition-all duration-300`}
        >
          {loading ? 'Processing...' : 'Get Recommendations'}
        </button>
      ) : (
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-300"
        >
          Next
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full py-8 bg-blue-950 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6">
        {!formSubmitted ? (
          <>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-white mb-6 text-center">
              Plan Your Career Path
            </h2>
            <p className="text-blue-200 text-center mb-8">
              Answer a few questions about your skills, interests, and goals to get personalized career recommendations.
            </p>

            {renderProgressSteps()}

            {error && (
              <div className="bg-red-900/50 border border-red-400 text-red-100 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-blue-900/20 p-6 rounded-lg border border-blue-800 shadow-lg">
              {renderStepContent()}
              {renderStepNavigation()}
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-white">
                Your Career Recommendations
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-all duration-300"
              >
                Start Over
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
              </div>
            ) : recommendations ? (
              <FlowDiagram careerData={recommendations} />
            ) : (
              <div className="bg-red-900/50 border border-red-400 text-red-100 px-4 py-3 rounded">
                Failed to generate recommendations. Please try again.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CareerForm;
