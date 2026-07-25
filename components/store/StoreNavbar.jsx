"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import KartaLogoIcon from "../KartaLogoIcon";

const StoreNavbar = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
      <Link href="/" className="flex items-center gap-2.5 relative text-4xl font-bold tracking-tight text-[#002642] group">
        <KartaLogoIcon className="w-9 h-9 group-hover:scale-105 transition-transform" />
        <span>
          <span className="text-[#E59500]">K</span>arta
          <span className="text-[#E59500] text-5xl leading-none">.</span>
        </span>
        <p className="absolute text-xs font-semibold -top-1 -right-11 px-2.5 py-0.5 rounded-full flex items-center gap-2 text-white bg-[#002642] shadow-xs">
          Store
        </p>
      </Link>
      <div className="flex items-center gap-3">
        <p>Hi, {user?.firstName}</p>
        <UserButton />
      </div>
    </div>
  );
};

export default StoreNavbar;
