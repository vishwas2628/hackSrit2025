import { UserInput } from "../models/userModel.js";
import { formatFlowChart } from "../services/flowchart.services.js";

const getFlowchartData = async (req, res) => {
  try {
    const latestInput = await UserInput.findOne().sort({ createdAt: -1 });
    if (!latestInput) {
      return res.status(404).json({ error: "no data found" });
    }

    const nodes = formatFlowChart(latestInput.recommendations);

    const edges = nodes.map((node, index) => ({
      id: `edge-${index + 1}`,
      source: "root",
      target: node.id,
      animated: true,
      style: { stroke: "#3B82F6" },
    }));
    const flowchartData = [
      {
        id: "root",
        data: { label: "Your Career Path" },
        position: { x: 250, y: 5 },
        style: {
          background: "#1E40AF",
          color: "white",
          border: "1px solid #3B82F6",
        },
      },
      ...nodes,
      ...edges,
    ];
    res.json(flowchartData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flowchart data" });
  }
};

export { getFlowchartData };
