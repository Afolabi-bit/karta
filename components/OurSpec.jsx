import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'

const OurSpecs = () => {

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title visibleButton={false} title='Our Specifications' description="We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free." />

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-12 mt-20'>
                {
                    ourSpecsData.map((spec, index) => {
                        const palette = [
                            { bg: 'bg-[#E59500]/8', border: 'border-[#E59500]/30', badgeBg: 'bg-[#E59500]', text: 'text-[#002642]' },
                            { bg: 'bg-[#840032]/8', border: 'border-[#840032]/30', badgeBg: 'bg-[#840032]', text: 'text-[#002642]' },
                            { bg: 'bg-[#002642]/8', border: 'border-[#002642]/30', badgeBg: 'bg-[#002642]', text: 'text-[#002642]' },
                        ][index % 3];

                        return (
                            <div className={`relative h-48 px-8 flex flex-col items-center justify-center w-full text-center border rounded-2xl group transition-all duration-300 hover:shadow-lg ${palette.bg} ${palette.border}`} key={index}>
                                <h3 className={`font-bold text-lg ${palette.text}`}>{spec.title}</h3>
                                <p className='text-sm text-slate-600 mt-2.5 leading-relaxed'>{spec.description}</p>
                                <div className={`absolute -top-5 text-white size-11 flex items-center justify-center rounded-xl shadow-md group-hover:scale-110 transition-transform ${palette.badgeBg}`}>
                                    <spec.icon size={22} />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default OurSpecs