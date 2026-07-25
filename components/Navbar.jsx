"use client";
import { SignInButton, Show, UserButton, useAuth } from "@clerk/nextjs";
import { PackageIcon, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import KartaLogoIcon from "./KartaLogoIcon";

const Navbar = () => {
  const router = useRouter();
  const { has } = useAuth();
  const isPlus = Boolean(has && has({ plan: "plus" }));

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const cartCount = useSelector((state) => state.cart.total);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
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

  const handleSearch = (e) => {
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
            <KartaLogoIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
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
            <Link href="/" className="hover:text-[#E59500] transition">
              About
            </Link>
            <Link href="/" className="hover:text-[#E59500] transition">
              Contact
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
                      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-[#E59500] rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Products ({searchResults.length})
                      </div>
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setShowDropdown(false);
                            setSearch("");
                            router.push(`/product/${product.id}`);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition"
                        >
                          <div className="size-10 bg-slate-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover size-10"
                              />
                            ) : (
                              <div className="size-8 bg-slate-200 rounded" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.category}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-[#E59500]">
                            {currency}{product.price}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500 text-center">
                      No products found for &quot;{search}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-700 hover:text-[#E59500] transition"
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              <button className="absolute -top-1.5 -right-2 text-[10px] font-bold text-white bg-[#E59500] size-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </button>
            </Link>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-7 py-2 bg-[#002642] hover:bg-[#840032] transition-colors text-white font-medium rounded-full shadow-sm">
                  Login
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div
                className={
                  isPlus
                    ? "p-1 rounded-full bg-linear-to-tr from-[#E59500] via-[#840032] to-[#38BDF8] shadow-md transition-transform hover:scale-105 flex items-center justify-center"
                    : ""
                }
              >
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      labelIcon={<PackageIcon size={16} />}
                      label="My Orders"
                      onClick={() => router.push("/orders")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </Show>
          </div>

          {/* Mobile User Button  */}
          <div className="sm:hidden">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-6 py-1.5 bg-[#002642] hover:bg-[#840032] text-sm transition-colors text-white font-medium rounded-full shadow-sm">
                  Login
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div
                className={
                  isPlus
                    ? "p-1 rounded-full bg-linear-to-tr from-[#E59500] via-[#840032] to-[#38BDF8] shadow-md transition-transform hover:scale-105 flex items-center justify-center"
                    : ""
                }
              >
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      labelIcon={<ShoppingCart size={16} />}
                      label="Cart"
                      onClick={() => router.push("/cart")}
                    />
                    <UserButton.Action
                      labelIcon={<PackageIcon size={16} />}
                      label="My Orders"
                      onClick={() => router.push("/orders")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
