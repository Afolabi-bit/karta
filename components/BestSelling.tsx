'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import ProductSkeleton from './ProductSkeleton'
import { useAppSelector } from '@/lib/store'

const BestSelling = () => {

    const displayQuantity = 8
    const { list: products, loading } = useAppSelector(state => state.product)

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {loading ? (
                    Array.from({ length: displayQuantity }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))
                ) : (
                    products.slice().sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0)).slice(0, displayQuantity).map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))
                )}
            </div>
        </div>
    )
}

export default BestSelling
