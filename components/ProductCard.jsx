'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // calculate the average rating of the product
    const rating = product.rating && product.rating.length > 0
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0;

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto block'>
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg overflow-hidden flex items-center justify-center relative'>
                <Image
                    width={500}
                    height={500}
                    className='w-full h-full object-cover group-hover:scale-105 transition duration-300'
                    src={product.images[0]}
                    alt={product.name || "Product image"}
                />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p className='font-medium line-clamp-1'>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#E59500" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className='font-semibold'>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard