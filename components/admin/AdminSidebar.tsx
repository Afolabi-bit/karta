"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShieldCheckIcon,
  StoreIcon,
  TicketPercentIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const AdminSidebar = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Stores", href: "/admin/stores", icon: StoreIcon },
    { name: "Approve Store", href: "/admin/approve", icon: ShieldCheckIcon },
    { name: "Coupons", href: "/admin/coupons", icon: TicketPercentIcon },
  ];

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className="hidden sm:flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60 bg-white shrink-0">
        {user && (
          <div className="flex flex-col gap-3 justify-center items-center pt-8">
            {user.imageUrl && (
              <Image
                className="w-14 h-14 rounded-full shadow-xs object-cover"
                src={user.imageUrl}
                alt=""
                width={80}
                height={80}
                style={{ width: "auto", height: "auto" }}
              />
            )}
            <p className="text-slate-800 font-semibold text-sm text-center px-2">
              Hi, {user.fullName?.split(" ").slice(0, 2).join(" ")}
            </p>
          </div>
        )}

        <div className="mt-4">
          {sidebarLinks.map((link, index) => {
            const IconComponent = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={index}
                href={link.href}
                className={`relative flex items-center gap-3 text-slate-600 hover:bg-slate-50 p-3 text-sm font-medium transition ${
                  isActive ? "bg-slate-100/90 text-[#002642] font-semibold" : "text-slate-500"
                }`}
              >
                <IconComponent size={20} className="ml-4" />
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute bg-[#E59500] right-0 top-1.5 bottom-1.5 w-1.5 rounded-l"></span>
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
        {sidebarLinks.map((link, index) => {
          const IconComponent = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={index}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                isActive ? "text-[#E59500] font-semibold" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <IconComponent size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.75]"} />
              <span className="text-[10px] tracking-tight mt-0.5">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default AdminSidebar;
