const formatFlowChart = (recommendations) => {
  return recommendations.map((item, index) => ({
    id: `node-${index + 1}`,
    data: { label: item.career },

    position: { x: 250, y: 100 + index * 100 },
    style: {
      background: "#1E40AF",
      color: "white",
      border: "1px solid #3B82F6",
    },
  }));
};

export { formatFlowChart };
