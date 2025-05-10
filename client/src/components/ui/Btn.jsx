import React from 'react'
import { Button } from "@material-tailwind/react"

const Btn = ({text1}) => {
  return (
    <Button  variant="gradient" className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">{text1}</Button>
  )
}

export default Btn