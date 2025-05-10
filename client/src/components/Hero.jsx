import React from 'react'
import assets from '../assets/assets.js'

const Hero = () => {
  return (
            <div className="flex flex-col sm:flex-row border border-gray-400">
                <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
                    <div className="text-[#414141]">
                        <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">Discover your perfect Career path with AI</h1>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm md:text-base">SHOP NOW</p>
                            <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
                        </div>
                    </div>
                </div>
                <img src={assets.logo} className="w-full sm:w-1/2" alt="" />
    
            </div>
  )
}

export default Hero