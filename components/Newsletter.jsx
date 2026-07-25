import React from 'react'
import Title from './Title'

const Newsletter = () => {
    return (
        <div className='flex flex-col items-center mx-4 my-28'>
            <Title title="Join Newsletter" description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week." visibleButton={false} />
            <div className='flex bg-white text-sm p-1.5 rounded-full w-full max-w-xl my-8 border border-slate-200 shadow-md focus-within:ring-2 focus-within:ring-[#002642] transition'>
                <input className='flex-1 pl-6 outline-none text-slate-800 placeholder-slate-400' type="email" placeholder='Enter your email address' />
                <button className='font-semibold bg-[#002642] hover:bg-[#840032] text-white px-8 py-3 rounded-full hover:scale-102 active:scale-95 transition shadow-sm'>Get Updates</button>
            </div>
        </div>
    )
}

export default Newsletter