'use client'
import React from 'react'

const ProductSkeleton = () => {
    return (
        <div className='animate-pulse max-xl:mx-auto block'>
            <div className='bg-slate-200 h-40 w-44 sm:w-60 sm:h-68 rounded-lg overflow-hidden' />
            <div className='flex justify-between gap-3 pt-2 max-w-60'>
                <div className='space-y-2'>
                    <div className='h-4 w-28 sm:w-32 bg-slate-200 rounded' />
                    <div className='flex gap-1 pt-1'>
                        {Array(5).fill('').map((_, index) => (
                            <div key={index} className='w-3.5 h-3.5 bg-slate-200 rounded-full' />
                        ))}
                    </div>
                </div>
                <div className='h-4 w-12 bg-slate-200 rounded' />
            </div>
        </div>
    )
}

export default ProductSkeleton
