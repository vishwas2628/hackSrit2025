import React from "react";
import ReactFlow, { Controls, Background, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import assets from "../assets/assets";

// Generate nodes and edges for ReactFlow
const generateFlowData = (data) => {
  const nodes = [];
  const edges = [];
  const years = Object.keys(data.career_predictions);

  years.forEach((year, index) => {
    const yearData = data.career_predictions[year];

    // Add year block as a node 
    // bCktrack your data 
    nodes.push({
      id: year,
      type: "default",
      position: { x: 200 * index, y: 0 },
      data: {
        label: (
          <div className="bg-white shadow-lg p-4 rounded-lg border">
            <h3 className="text-lg font-bold text-blue-600">{year}</h3>
            <p className="text-sm text-gray-600">{yearData.focus}</p>
            <ul className="mt-2 space-y-1">
              {yearData.recommendations.map((rec, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium text-gray-700">{rec.area}: </span>
                  {rec.details}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    });

    // Connect blocks with edges
    if (index > 0) {
      edges.push({
        id: `e${years[index - 1]}-${year}`,
        source: years[index - 1],
        target: year,
        animated: true,
      });
    }
  });

  return { nodes, edges };
};

const Dashboard = () => {
  const { nodes, edges } = generateFlowData(assets.jsonData);

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Dashboard;
