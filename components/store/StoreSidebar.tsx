'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface StoreSidebarProps {
    storeInfo?: {
        name?: string;
        logo?: string;
    } | null;
}

const StoreSidebar: React.FC<StoreSidebarProps> = ({ storeInfo }) => {
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    return (
        <>
            {/* Desktop Vertical Sidebar */}
            <aside className="hidden sm:flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60 bg-white shrink-0">
                <div className="flex flex-col gap-3 justify-center items-center pt-8">
                    {storeInfo?.logo && (
                        <Image
                            className="w-14 h-14 rounded-full shadow-md object-cover"
                            src={storeInfo.logo}
                            alt=""
                            width={80}
                            height={80}
                            style={{ width: "auto", height: "auto" }}
                        />
                    )}
                    <p className="text-slate-800 font-semibold text-sm px-2 text-center">{storeInfo?.name}</p>
                </div>

                <div className="mt-4">
                    {sidebarLinks.map((link, index) => {
                        const IconComponent = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={index}
                                href={link.href}
                                className={`relative flex items-center gap-3 text-slate-600 hover:bg-slate-50 p-3 text-sm font-medium transition ${
                                    isActive ? 'bg-slate-100/90 text-[#002642] font-semibold' : 'text-slate-500'
                                }`}
                            >
                                <IconComponent size={20} className="ml-4" />
                                <span>{link.name}</span>
                                {isActive && (
                                    <span className="absolute bg-[#E59500] right-0 top-1.5 bottom-1.5 w-1.5 rounded-l"></span>
                                )}
                            </Link>
                        )
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
                                isActive ? 'text-[#E59500] font-semibold' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <IconComponent size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.75]"} />
                            <span className="text-[10px] tracking-tight mt-0.5">{link.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}

export default StoreSidebar
