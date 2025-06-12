import { CareerRecommendation } from "../models/careerRecommendation.js";
import { ApiError } from "../utils/apiError.js";

const getFlowchartData = async (req, res) => {
  try {
    const latestInput = await CareerRecommendation.findOne().sort({ createdAt: -1 });
    if (!latestInput) {
      return res.status(404).json({ error: "No career data found" });
    }

    if (!latestInput.recommendations || latestInput.recommendations.length === 0) {
      return res.status(404).json({ error: "No career recommendations found" });
    }

    // Get recommendations and limit to a reasonable maximum to prevent overcrowding
    const MAX_VISIBLE_RECOMMENDATIONS = 8;
    let recommendations = [...latestInput.recommendations];
    let hasMoreRecommendations = false;
    
    if (recommendations.length > MAX_VISIBLE_RECOMMENDATIONS) {
      hasMoreRecommendations = true;
      recommendations = recommendations.slice(0, MAX_VISIBLE_RECOMMENDATIONS);
    }
    
    // Calculate optimal positioning for nodes
    const nodeCount = recommendations.length;
    
    // Dynamic radius calculation based on number of nodes
    // More nodes = larger radius to prevent overcrowding
    const baseRadius = 250;
    const circleRadius = baseRadius + (nodeCount * 20);
    
    const centerX = 400;      // Center X position
    const startY = 100;       // Starting Y position
    const verticalSpacing = Math.max(100, 200 - (nodeCount * 10)); // Dynamic spacing based on node count
    
    // Choose layout strategy based on number of nodes
    let nodes = [];
    
    if (nodeCount <= 3) {
      // Horizontal layout for small number of nodes
      nodes = recommendations.map((rec, index) => {
        const spacing = 300;
        const startX = centerX - ((nodeCount - 1) * spacing / 2);
        const x = startX + (index * spacing);
        const y = startY + 150;
        
        return createNode(rec, index, x, y);
      });
    } else {
      // Semi-circular layout for more nodes
      nodes = recommendations.map((rec, index) => {
        // More even distribution around the semi-circle
        const angle = (Math.PI / (nodeCount + 1)) * (index + 1);
        const x = centerX + circleRadius * Math.cos(angle);
        const y = startY + verticalSpacing * (index + 1);
        
        return createNode(rec, index, x, y);
      });
    }
    
    // Add "More recommendations" node if we had to limit the results
    if (hasMoreRecommendations) {
      const moreNode = {
        id: "more-node",
        data: { 
          label: `+${latestInput.recommendations.length - MAX_VISIBLE_RECOMMENDATIONS} more options`
        },
        position: { 
          x: centerX, 
          y: startY + (verticalSpacing * (nodeCount + 1)) 
        },
        style: {
          background: "#4B5563",
          color: "white",
          border: "1px solid #6B7280",
          width: 180,
          padding: 10,
          borderRadius: 5,
          fontStyle: "italic"
        },
      };
      nodes.push(moreNode);
    }
    
    // Helper function to create a consistently styled node
    function createNode(rec, index, x, y) {
      return {
        id: `node-${index + 1}`,
        data: { 
          label: rec.career,
          description: rec.description // Include description for tooltips if needed
        },
        position: { x, y },
        style: {
          background: "#1E40AF",
          color: "white",
          border: "1px solid #3B82F6",
          width: 180,
          padding: 10,
          borderRadius: 5
        },
      };
    }

    // Create edges with variations based on node type
    const edges = nodes.map((node, index) => {
      // Create different edge styles based on node type or position
      let edgeStyle = {
        stroke: "#3B82F6",
        strokeWidth: 2,
      };
      
      let animated = true;
      
      // If this is the "more" node, use a different style
      if (node.id === "more-node") {
        edgeStyle = {
          stroke: "#9CA3AF",
          strokeWidth: 1,
          strokeDasharray: "5,5"
        };
        animated = false;
      } 
      // Alternate edge styles for regular nodes
      else if (index % 2 === 0) {
        edgeStyle.strokeWidth = 3;
      }
      
      return {
        id: `edge-${node.id}`,
        source: "root",
        target: node.id,
        animated: animated,
        style: edgeStyle,
      };
    });

    // Position root node in center at the top
    const flowchartData = [
      {
        id: "root",
        data: { label: "Your Career Path" },
        position: { x: centerX, y: 20 },
        style: {
          background: "#1E40AF",
          color: "white",
          border: "1px solid #3B82F6",
          width: 180,
          padding: 10,
          borderRadius: 5,
          fontWeight: "bold"
        },
      },
      ...nodes,
      ...edges,
    ];
    
    // Add metadata about the chart
    const metadata = {
      totalRecommendations: latestInput.recommendations.length,
      visibleRecommendations: recommendations.length,
      hasMoreRecommendations: hasMoreRecommendations
    };
    
    res.json({
      elements: flowchartData,
      metadata: metadata
    });
  } catch (error) {
    console.error("Error generating flowchart:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch flowchart data" });
  }
};

export { getFlowchartData };
