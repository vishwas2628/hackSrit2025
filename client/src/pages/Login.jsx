import React from 'react'
import Title from '../../../../Ecommerce-Website/frontend/src/components/Title'

const Login = () => {
  return (
    <form className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800' action="">
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'><Title text1={"Log"} text2={'-In'}/></p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      {/* {currentState === 'Login' ? '' :<input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required />} */}
      <input  type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />
      <input  type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required />
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Forget Your Password</p>
        {/* {
          currentState === 'Login'
          ? <p  className='cursor-pointer'>Create Account</p>
          : <p  className='cursor-pointer'>Login Here</p>
        } */}
      </div>
      <button type='submit' className='bg-black text-white font-light px-8 py-2 mt-4'>dfd</button>
    </form>
  )
}

export default Login