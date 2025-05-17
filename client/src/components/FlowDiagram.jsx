import React, { useState, useEffect } from "react";

const FlowDiagram = ({ careerData }) => {
  // Animation words for focus section titles
  const focusWords = ["Focus", "Priority", "Goal", "Target", "Mission"];
  const [currentFocusWord, setCurrentFocusWord] = useState(focusWords[0]);
  const [expandedNodes, setExpandedNodes] = useState({});

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      setCurrentFocusWord((prev) => {
        const currentIndex = focusWords.indexOf(prev);
        return focusWords[(currentIndex + 1) % focusWords.length];
      });
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(shuffleInterval);
  }, []);

  // If no data is provided, show a message
  if (!careerData || !careerData.career_predictions) {
    return (
      <div className="w-full py-12 flex items-center justify-center bg-blue-950">
        <div className="text-white text-center">
          <p>No career data available. Please complete the form to see recommendations.</p>
        </div>
      </div>
    );
  }

  const { career_predictions } = careerData;
  const yearKeys = Object.keys(career_predictions);

  const renderYearNode = (yearKey, index) => {
    const year = career_predictions[yearKey];
    const isExpanded = expandedNodes[yearKey] || false;
    
    // Apply different styles to alternate nodes for visual variety
    const isSpecialNode = index % 2 === 1;
    const nodeStyles = isSpecialNode
      ? "bg-blue-900/70 border-blue-300 hover:bg-blue-800 hover:border-blue-400 text-blue-200"
      : "bg-blue-800/50 border-blue-400 hover:bg-blue-700/70 text-white";

    return (
      <div 
        key={yearKey}
        className={`w-full sm:w-60 p-4 ${nodeStyles} border-2 rounded-lg flex flex-col items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer`}
        onClick={() => toggleNodeExpansion(yearKey)}
      >
        <h3 className="text-xl font-medium mb-2">
          {yearKey.replace('year_', 'Year ')}
        </h3>
        <div className="flex items-center mb-3">
          <span className="mr-2 text-sm opacity-80">{currentFocusWord}:</span>
          <span className="font-semibold">{year.focus}</span>
        </div>
        
        {/* Expandable recommendations section */}
        <div className={`w-full overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-3 border-t border-blue-400/30">
            <h4 className="text-sm font-semibold mb-2">Recommendations:</h4>
            <ul className="text-sm space-y-2">
              {year.recommendations.map((rec, idx) => (
                <li key={idx} className="hover:bg-blue-800/40 p-2 rounded-md transition-all">
                  <span className="font-medium text-blue-300">{rec.area}:</span> {rec.details}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Indicator to show expandable content */}
        <div className={`mt-2 text-blue-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
    );
  };

  // Generate connector lines between nodes
  const renderConnectors = () => {
    return yearKeys.slice(0, -1).map((_, index) => (
      <div 
        key={`connector-${index}`} 
        className="w-12 h-10 flex items-center justify-center my-1 sm:my-2"
      >
        <div className="h-full w-1 bg-blue-500/50 animate-pulse"></div>
      </div>
    ));
  };

  return (
    <div className="w-full flex items-center justify-center bg-blue-950 dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="w-full max-w-4xl px-4 py-8 sm:py-10">
        <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-white mb-8 text-center">
          Your Career Progression
        </h2>
        
        <div className="flex flex-col items-center justify-center space-y-1">
          {/* Start node */}
          <div className="w-32 h-12 bg-green-700/80 border-2 border-green-400 rounded-full flex items-center justify-center text-white font-semibold mb-2 animate-pulse">
            Start
          </div>
          
          <div className="h-10 w-1 bg-blue-500/50"></div>
          
          {/* Year nodes with connectors between them */}
          {yearKeys.map((yearKey, index) => (
            <React.Fragment key={`fragment-${yearKey}`}>
              {renderYearNode(yearKey, index)}
              {index < yearKeys.length - 1 && renderConnectors()}
            </React.Fragment>
          ))}
          
          {/* End node */}
          <div className="h-10 w-1 bg-blue-500/50"></div>
          <div className="w-32 h-12 bg-purple-700/80 border-2 border-purple-400 rounded-full flex items-center justify-center text-white font-semibold mt-2">
            Future Growth
          </div>
        </div>
        
        <div className="mt-8 text-center text-blue-300 text-sm">
          <p>Click on each stage to view detailed recommendations</p>
        </div>
      </div>
    </div>
  );
};

export default FlowDiagram;
