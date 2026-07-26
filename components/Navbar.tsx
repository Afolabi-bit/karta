"use client";
import { SignInButton, Show, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { PackageIcon, Search, ShoppingCart, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/store";
import axios from "axios";
import KartaLogoIcon from "./KartaLogoIcon";
import { ProductWithDetails } from "@/types";

const Navbar = () => {
  const router = useRouter();
  const { has, getToken } = useAuth();
  const { user } = useUser();
  const isPlus = Boolean(has && has({ plan: "plus" }));

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProductWithDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasStore, setHasStore] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartCount = useAppSelector((state) => state.cart.total);

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!user) {
        setHasStore(false);
        setIsSeller(false);
        return;
      }
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/store/seller", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasStore(Boolean(data?.hasStore || data?.isSeller));
        setIsSeller(Boolean(data?.isSeller));
      } catch (error) {
        setHasStore(false);
        setIsSeller(false);
      }
    };

    checkSellerStatus();
  }, [user, getToken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { data } = await axios.get(
          `/api/search?q=${encodeURIComponent(search.trim())}`,
        );
        setSearchResults(data.products || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search API error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="relative bg-white border-b border-slate-200">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-4xl font-bold tracking-tight text-[#002642] group"
          >
            <KartaLogoIcon className="hidden sm:block w-10 h-10 group-hover:scale-105 transition-transform" />
            <span>
              <span className="text-[#E59500]">K</span>arta
              <span className="text-[#E59500] text-5xl leading-none">.</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-700 font-medium">
            <Link href="/" className="hover:text-[#E59500] transition">
              Home
            </Link>
            <Link href="/shop" className="hover:text-[#E59500] transition">
              Shop
            </Link>

            <div ref={searchRef} className="relative hidden xl:block">
              <form
                onSubmit={handleSearch}
                className="flex items-center w-xs text-sm gap-2 bg-slate-100 focus-within:bg-slate-200/80 px-4 py-2.5 rounded-full transition"
              >
                <Search size={18} className="text-slate-500" />
                <input
                  className="w-full bg-transparent outline-none placeholder-slate-500"
                  type="text"
                  placeholder="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  required
                />
              </form>

              {/* Live Search Dropdown */}
              {showDropdown && search.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-[#E59500] rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded-md bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#E59500] font-semibold">
                            {currency}
                            {product.price}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">
                      No products found for "{search}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/cart"
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition"
            >
              <ShoppingCart size={22} className="text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E59500] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            <Show when="signed-in">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#E59500] px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition max-sm:hidden"
              >
                <PackageIcon size={16} />
                <span>My Orders</span>
              </Link>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-[#002642] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#840032] transition">
                  Sign In
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Orders"
                    labelIcon={<PackageIcon size={16} />}
                    onClick={() => router.push("/orders")}
                  />
                  {hasStore && (
                    <UserButton.Action
                      label="My Store"
                      labelIcon={<Store size={16} />}
                      onClick={() => router.push("/store")}
                    />
                  )}
                </UserButton.MenuItems>
              </UserButton>
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
