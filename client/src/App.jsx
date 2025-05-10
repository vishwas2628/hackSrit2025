import { useState } from 'react'
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
//react router

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/user/:id" element={<Product />} /> */}
            </Routes>
            <Footer/>
          </div>
    </>
  )
}

export default App
