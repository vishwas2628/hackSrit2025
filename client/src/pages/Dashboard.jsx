import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

// Career progression chart component
const CareerFlowChart = ({ careerData }) => {
  const focusWords = ["Focus", "Priority", "Goal", "Vision", "Mission"];
  const years = Object.keys(careerData.career_predictions);

  // Generate flow data
  const generateFlowData = () => {
    const nodes = [];
    const edges = [];

    years.forEach((year, index) => {
      const yearData = careerData.career_predictions[year];
      const [currentFocus, setCurrentFocus] = useState(focusWords[0]);
      const [isExpanded, setIsExpanded] = useState(false);

      // Shuffling effect for focus label
      useEffect(() => {
        const shuffleInterval = setInterval(() => {
          setCurrentFocus((prev) => {
            const currentIndex = focusWords.indexOf(prev);
            return focusWords[(currentIndex + 1) % focusWords.length];
          });
        }, 1500); // Change word every 1.5 seconds

        return () => clearInterval(shuffleInterval);
      }, []);

      // Node content with expandable details
      nodes.push({
        id: year,
        type: "default",
        position: { x: 240 * index, y: 0 },
        data: {
          label: (
            <div
              className={`bg-blue-900/80 shadow-[0_4px_15px_rgba(59,130,246,0.4)] p-5 rounded-xl border-2 border-blue-400 hover:scale-110 hover:border-blue-300 hover:bg-blue-800/90 transition-all duration-300 cursor-pointer ${
                isExpanded ? "scale-105" : ""
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <h3 className="text-xl font-serif font-bold text-white">
                {year}
              </h3>
              <p className="text-sm text-blue-200 mt-2">
                <span className="inline-block transition-all duration-300 hover:skew-x-12 hover:text-blue-100">
                  {currentFocus}:
                </span>{" "}
                {yearData.focus}
              </p>
              <ul
                className={`mt-3 space-y-2 transition-all duration-300 ${
                  isExpanded
                    ? "opacity-100 max-h-96"
                    : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                {yearData.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="text-sm text-white hover:text-blue-200"
                  >
                    <span className="font-medium text-blue-300">
                      {rec.area}:
                    </span>{" "}
                    {rec.details}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
        draggable: true,
      });

      // Connect blocks with edges
      if (index > 0) {
        edges.push({
          id: `e${years[index - 1]}-${year}`,
          source: years[index - 1],
          target: year,
          animated: true,
          style: {
            stroke: "rgba(59, 130, 246, 0.7)",
            strokeWidth: 3,
            transition: "stroke 0.3s ease",
          },
          markerEnd: {
            type: "arrowclosed",
            color: "rgba(59, 130, 246, 0.7)",
          },
        });
      }
    });

    return { nodes, edges };
  };

  const { nodes: initialNodes, edges: initialEdges } = generateFlowData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="h-96 w-full bg-gray-950 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        fitView
        className="bg-gray-950/50"
      >
        <Background gap={16} size={1} color="rgba(59, 130, 246, 0.2)" />
        <Controls className="bg-blue-900/70 text-white border-2 border-blue-400 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:bg-blue-800/70 transition-all duration-300" />
      </ReactFlow>
    </div>
  );
};

// Stat card component
const StatCard = ({ title, value, icon, change, isPositive }) => (
  <div className="bg-gray-800 rounded-lg p-5 shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <span className="p-2 rounded-lg bg-blue-900/30 text-blue-400">
        {icon}
      </span>
    </div>
    {change && (
      <div
        className={`flex items-center mt-4 ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        <span className="mr-1">{isPositive ? "↑" : "↓"}</span>
        <span className="text-sm">{change} since last month</span>
      </div>
    )}
  </div>
);

// Activity item component
const ActivityItem = ({ title, time, description, icon }) => (
  <div className="flex items-start space-x-3 p-3 hover:bg-gray-800/50 rounded-lg transition-all">
    <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400 shrink-0">
      {icon}
    </div>
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">{title}</h3>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

// Action card component
const ActionCard = ({ title, description, icon, linkTo }) => (
  <Link to={linkTo} className="block">
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:bg-gray-700 hover:border-blue-500 transition-all">
      <div className="p-3 rounded-lg bg-blue-900/30 text-blue-400 mb-3 inline-block">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </Link>
);

// Progress bar component
const ProgressBar = ({ value, max, label, color = "blue" }) => (
  <div className="mb-5">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-sm font-medium text-gray-400">
        {value}/{max}
      </span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className={`bg-${color}-500 h-2 rounded-full`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

// Main Dashboard component
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    progress: {
      skills: 8,
      totalSkills: 20,
      courses: 3,
      totalCourses: 5,
      projects: 2,
      totalProjects: 4,
    },
    stats: {
      skillsAcquired: 8,
      coursesCompleted: 3,
      projectsFinished: 2,
      connections: 15,
    },
    activities: [
      {
        title: "Completed Python Course",
        time: "2 days ago",
        description: "Finished Python for Data Science with 95% score",
        icon: "🎓",
      },
      {
        title: "Added New Skill",
        time: "1 week ago",
        description: "Added React.js to your skill portfolio",
        icon: "✅",
      },
      {
        title: "Updated Career Path",
        time: "2 weeks ago",
        description: "Changed focus from Web Development to Data Science",
        icon: "🛣️",
      },
    ],
  });

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || "Welcome"}</h1>
              <p className="text-gray-400">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link to="/profile">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all">
                Edit Profile
              </button>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-900/50 hover:bg-red-900 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Career Progress Section */}
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Career Progress</h2>
                <Link
                  to="/career-planning"
                  className="text-blue-400 text-sm hover:underline"
                >
                  Update Career Plan
                </Link>
              </div>

              <CareerFlowChart careerData={assets.jsonData} />
            </div>

            {/* Progress Tracking */}
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-bold mb-6">
                Skill Development Progress
              </h2>

              <ProgressBar
                label="Skills Acquired"
                value={userData.progress.skills}
                max={userData.progress.totalSkills}
                color="blue"
              />

              <ProgressBar
                label="Courses Completed"
                value={userData.progress.courses}
                max={userData.progress.totalCourses}
                color="green"
              />

              <ProgressBar
                label="Projects Finished"
                value={userData.progress.projects}
                max={userData.progress.totalProjects}
                color="purple"
              />

              <div className="mt-6">
                <h3 className="font-medium mb-3">Recommended Next Steps:</h3>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50">
                  <p className="text-sm text-blue-200">
                    Complete the "Advanced Data Structures" course to unlock new
                    project opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard
                title="Take Assessment"
                description="Check your skills and get personalized recommendations"
                icon="📝"
                linkTo="/assessment"
              />

              <ActionCard
                title="Explore Courses"
                description="Browse our catalog of skills development courses"
                icon="🎓"
                linkTo="/courses"
              />

              <ActionCard
                title="Find Mentors"
                description="Connect with professionals in your field"
                icon="👥"
                linkTo="/mentors"
              />

              <ActionCard
                title="Track Opportunities"
                description="Discover jobs, internships, and projects"
                icon="🚀"
                linkTo="/opportunities"
              />
            </div>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <StatCard
                title="Skills Acquired"
                value={userData.stats.skillsAcquired}
                icon="🧠"
                change="12%"
                isPositive={true}
              />

              <StatCard
                title="Courses Completed"
                value={userData.stats.coursesCompleted}
                icon="📚"
                change="20%"
                isPositive={true}
              />

              <StatCard
                title="Projects Finished"
                value={userData.stats.projectsFinished}
                icon="💻"
                change="33%"
                isPositive={true}
              />

              <StatCard
                title="Network Connections"
                value={userData.stats.connections}
                icon="🔗"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

              <div className="space-y-3">
                {userData.activities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    time={activity.time}
                    description={activity.description}
                    icon={activity.icon}
                  />
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/activities"
                  className="text-sm text-blue-400 hover:underline"
                >
                  View All Activities
                </Link>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">React Project</h3>
                    <p className="text-sm text-gray-400">Portfolio showcase</p>
                  </div>
                  <div className="text-yellow-400 text-sm font-medium">
                    2 days left
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">JavaScript Assessment</h3>
                    <p className="text-sm text-gray-400">Skill certification</p>
                  </div>
                  <div className="text-red-400 text-sm font-medium">
                    Tomorrow
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
