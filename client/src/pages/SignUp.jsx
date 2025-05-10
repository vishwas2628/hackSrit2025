import React from 'react'
import assets from '../assets/assets.js';


const SignUp = () => {
  return (
    <div className="flex h-screen bg-[#212121]">
      {/* Left Section */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center bg-[#212121] text-white p-8">
        <h1 className="text-2xl font-semibold mb-2">Sign up to <span className="text-blue-500">FutureMap</span></h1>
        <p className="text-sm mb-8">
          Do you have an account? <a href="/login" className="text-blue-500 hover:underline">Sign In</a>
        </p>
        {/* SignUp Form */}
        <form className="w-full max-w-sm">
          <div className="mb-4">
            <label htmlFor="user" className="block text-sm font-medium mb-1">User-name</label>
            <input
              type="text"
              id="user"
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-600 transition"
          >
            Sign in
          </button>
        </form>
      </div>

      {/* Right Section */}
      <div
        className="hidden sm:block sm:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${assets.login_background_dark})`,
        }}
      ></div>
    </div>

  )
}

export default SignUp