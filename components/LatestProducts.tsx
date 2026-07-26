'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import ProductSkeleton from './ProductSkeleton'
import { useAppSelector } from '@/lib/store'

const LatestProducts = () => {

    const displayQuantity = 4
    const { list: products, loading } = useAppSelector(state => state.product)

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {loading ? (
                    Array.from({ length: displayQuantity }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))
                ) : (
                    products.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, displayQuantity).map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))
                )}
            </div>
        </div>
    )
}

export default LatestProducts
