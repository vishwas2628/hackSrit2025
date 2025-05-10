import Btn  from "../components/ui/Btn.jsx";
import Inp  from "../components/ui/Inp.jsx";
import Image from '../assets/login_background_dark.png'
import React from "react";

const Login= () => {
  return (
    <div className="h-screen w-screen bg-gray-900 flex " >
        <div className="flex flex-col justify-center  p-8 md:w-1/2" style={{
        backgroundColor:"#262727"
      }}>
          <div className="mb-8">
            <img
              src="../assets/futuremapLogo.png"
              alt="FutureMap Logo"
              className="h-12 mb-4"
            />
            <h2 className="text-3xl text-white font-bold">Log in to <span className="text-blue-500">FutureMap</span></h2>
            <p className="text-gray-400 mt-2">
              Don't have an account? <a href="/register" className="text-blue-500 underline">Create an account</a>
            </p>
          </div>
          <form>
            <Inp/>
            <Inp/>
            < Btn text1="Sign-In"/>
          </form>
        </div>
        <div  style={{
        backgroundImage: `url(${Image})`,
        backgroundSize: 'contain', // or 'contain', 'auto'
        backgroundRepeat: 'no-repeat',
        height: '100%', // Set the height of the div
        width: '100%', // Set the width of the div
      }}>
        </div>
      </div>
  );
};

export default Login;
