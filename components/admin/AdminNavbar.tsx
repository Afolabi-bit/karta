"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import KartaLogoIcon from "../KartaLogoIcon";
import { ArrowLeftIcon } from "lucide-react";

const AdminNavbar = () => {
  const { user } = useUser();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 border-b border-slate-200 bg-white transition-all">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#002642] group"
        >
          <KartaLogoIcon className="hidden sm:block w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform shrink-0" />
          <span className="flex items-center gap-2">
            <span>
              <span className="text-[#E59500]">K</span>arta
              <span className="text-[#E59500] text-3xl sm:text-4xl leading-none">.</span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-[#840032] shadow-xs">
              Admin
            </span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden md:flex items-center gap-1 text-xs text-slate-500 hover:text-[#E59500] font-medium mr-2 transition"
        >
          <ArrowLeftIcon size={14} /> Main Site
        </Link>
        {user?.firstName && (
          <p className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:block">
            Hi, {user.firstName}
          </p>
        )}
        <UserButton />
      </div>
    </nav>
  );
};

export default AdminNavbar;
