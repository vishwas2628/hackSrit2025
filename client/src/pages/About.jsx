import React from 'react'
import assets from '../assets/assets.js'
import Card1 from "../components/Card1.jsx"
import Card2 from "../components/Card2.jsx"
import FlowDiagram from '../components/FlowDiagram.jsx'

const About = () => {
  return (
    <div>
      <Card1 img={assets.logo} text="lorem50" name="Vasu"/>
      <FlowDiagram/>
    </div>
  )
}

export default About