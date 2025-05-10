import { useState } from 'react'
import { useLocation } from 'react-router-dom';
import assets from './assets/assets.js';
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from './pages/Login.jsx'
import About from "./pages/About.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Profile from "./pages/Profile.jsx";
import Home from "./pages/Home.jsx";
import Internship from './pages/Internship.jsx';
//react router



function App() {
  const location = useLocation(); // Hook to get the current route

  // Check if the current route is login or signup
  const hideFooter = location.pathname === '/login' || location.pathname === '/signup';
  return (
        <div className="flex flex-col min-h-screen bg-[#18181A] font-mono">
         <Navbar />
      <main className="flex-1">
        {/* Main content */}
         <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard jsonData={assets.sampleJson}/>} />
              <Route path="/internship" element={<Internship />} />
              {/* <Route path="/user/:id" element={<Product />} /> */}
            </Routes>
      </main>
      <footer className="p-4">
        {/* Footer content */}
        {!hideFooter && <Footer />}
      </footer>
    </div>
  )
}

export default App
