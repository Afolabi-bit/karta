"use client";
import { SignInButton, Show, UserButton, useAuth } from "@clerk/nextjs";
import { PackageIcon, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import KartaLogoIcon from "./KartaLogoIcon";

const Navbar = () => {
  const router = useRouter();
  const { has } = useAuth();
  const isPlus = Boolean(has && has({ plan: "plus" }));

  const [search, setSearch] = useState("");
  const cartCount = useSelector((state) => state.cart.total);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
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

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 focus-within:bg-slate-200/80 px-4 py-2.5 rounded-full transition"
            >
              <Search size={18} className="text-slate-500" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-500"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

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
