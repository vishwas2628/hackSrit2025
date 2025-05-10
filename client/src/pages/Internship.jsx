import React from 'react'
import card2 from '../components/Card2'
import assets from "../assets/assets.js"
import Card2 from '../components/Card2'

const Internship = () => {
  return (
      <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.inter.map((inter, index) => (
        // Render the Card2 component for each item in the inter array
        <Card2 
          company={index[0]} // Use a unique key for each element in the map
          title={inter[1]} 
          skills={inter[2]} 
          location={inter[3]} 
        />
      ))}
    </div>
    </div>
  )
}

export default Internship