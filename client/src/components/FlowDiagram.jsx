import React from 'react';

const FlowDiagram = () => {
    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-4">
                <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded text-center p-2">
                    Start
                </div>
                <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded text-center p-2">
                    Process 1
                </div>
                <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded text-center p-2">
                    Process 2
                </div>
                <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded text-center p-2">
                    Decision
                </div>
                <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded text-center p-2">
                    Process 3
                </div>
                <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded text-center p-2">
                    End
                </div>
            </div>

            {/* Lines connecting the nodes */}
            <div className="bg-gray-400 h-1 w-40 relative left-16"></div>
            <div className="bg-gray-400 h-1 w-40 relative left-60 bottom-3"></div>
            <div className="bg-gray-400 w-1 h-24 relative left-16 bottom-1"></div>
            <div className="bg-gray-400 w-1 h-24 relative left-60 bottom-25"></div>
            <div className="bg-gray-400 h-1 w-40 relative left-16 bottom-23"></div>

        </div>
    );
};

export default FlowDiagram;