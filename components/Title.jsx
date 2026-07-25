'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {

    return (
        <div className='flex flex-col items-center text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-[#002642]'>{title}</h2>
            <div className='flex flex-col sm:flex-row items-center gap-3 text-sm text-slate-600 mt-2.5'>
                {description && <p className='max-w-lg text-center leading-relaxed'>{description}</p>}
                {visibleButton && (
                    <Link href={href} className='text-[#E59500] hover:text-[#CC8400] font-semibold inline-flex items-center gap-1.5 transition group'>
                        <span>View more</span>
                        <ArrowRight size={14} className='group-hover:translate-x-1 transition-transform' />
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Title