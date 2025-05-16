import React from 'react'

function Signup() {
  return (
    <div className='flex h-screen w-full'>

      <div className='w-full md:w-1/2 flex flex-col px-6 md:px-16 justify-center bg-gray-200'>
        <div className='bg-white p-6 rounded-2xl shadow-md'>
          <h1 className='font-semibold text-4xl p-5 text-center'>Welcome !</h1>
          <h2 className='font-semibold text-3xl text-center p-3 text-purple-900'>Sign Up</h2>
          <form className="flex flex-col gap-4">
          <input
              type="text"
              placeholder="Full Name"
              className="border border-gray-300 rounded-lg p-3 md:p-4"
            />
            <input
              type="email"
              placeholder="stanley@gmail.com"
              className="border border-gray-300 rounded-lg p-3 md:p-4"
            />
            <input
              type="password"
              placeholder="••••••••••••"
              className="border border-gray-300 rounded-lg p-3 md:p-4"
            />
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2 accent-purple-900"
                />
                <label htmlFor="remember" className="text-gray-600 text-sm md:text-base">Remember me</label>
              </div>
            </div>
            <button className="bg-purple-900 text-white py-3 rounded-lg font-medium">
              Sign Up
            </button>
          </form>
          <p className="text-gray-600 mt-6 text-center">
            Already have an account? <a href="/login" className="text-violet-500 font-medium">Sign In</a>
          </p>
        </div>
      </div>
  
      <div className='hidden md:flex w-1/2 bg-gray-200 flex-col items-center justify-center'>
        <img 
          src='/logo.png' 
          alt='logo' 
          width={340} 
          height={340}
          className='mb-4' 
        />
        <h3 className='font-semibold text-2xl text-center text-purple-900'>Chat Anytime, Anywhere</h3>
      </div>
    </div>
  )
}

export default Signup