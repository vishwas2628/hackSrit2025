import { useState, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Profile from "./pages/Profile.jsx";
import Home from "./pages/Home.jsx";
import Internship from "./pages/Internship.jsx";
import CareerPlanning from "./pages/CareerPlanning.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";

// Navigation wrapper component that knows about auth state
const NavbarWithAuth = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  return <Navbar isAuthenticated={isAuthenticated} loading={loading} />;
};

function App() {
  const location = useLocation(); // Hook to get the current route

  // Check if the current route is login or signup
  const hideFooter =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-[#18181A] font-mono">
        <NavbarWithAuth />
        <main className="flex-1">
          {/* Main content */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/career-planning" element={<CareerPlanning />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/internship" element={<Internship />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* <Route path="/profile" element={<Profile />} /> */}

              {/* Add other protected routes here */}
              <Route
                path="/assessment"
                element={<Navigate to="/dashboard" />}
              />
              <Route path="/courses" element={<Navigate to="/dashboard" />} />
              <Route path="/mentors" element={<Navigate to="/dashboard" />} />
              <Route
                path="/opportunities"
                element={<Navigate to="/dashboard" />}
              />
              <Route
                path="/activities"
                element={<Navigate to="/dashboard" />}
              />
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
                  <h1 className="text-4xl font-bold mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="mb-8">
                    The page you are looking for doesn't exist or has been
                    moved.
                  </p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-all"
                  >
                    Go Home
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        {!hideFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
