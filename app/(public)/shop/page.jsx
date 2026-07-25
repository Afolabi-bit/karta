"use client";
import { Suspense, useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import ProductSkeleton from "@/components/ProductSkeleton"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import axios from "axios"

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const { list: products, loading: reduxLoading } = useSelector(state => state.product)

    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        if (search) {
            setIsSearching(true)
            axios.get(`/api/search?q=${encodeURIComponent(search)}`)
                .then(({ data }) => {
                    setSearchResults(data.products || [])
                })
                .catch(err => {
                    console.error("Search API error:", err)
                    setSearchResults([])
                })
                .finally(() => {
                    setIsSearching(false)
                })
        }
    }, [search])

    const displayProducts = search ? searchResults : products
    const isLoading = search ? isSearching : reduxLoading

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />} {search ? `Search Results for "${search}"` : 'All'} <span className="text-slate-700 font-medium">Products</span></h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))
                    ) : displayProducts.length === 0 ? (
                        <div className="py-12 text-slate-500 font-medium">
                            No products found matching your search.
                        </div>
                    ) : (
                        displayProducts.map((product) => <ProductCard key={product.id} product={product} />)
                    )}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}