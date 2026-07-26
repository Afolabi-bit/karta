'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

interface StoreInfoProps {
    store: any;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ store }) => {
    return (
        <div className="flex-1 space-y-2 text-sm w-full">
            {store.logo && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 p-1 flex items-center justify-center overflow-hidden border border-slate-200 shadow-xs max-sm:mx-auto">
                    <Image
                        width={80}
                        height={80}
                        src={store.logo}
                        alt={store.name}
                        className="w-full h-full object-cover rounded-full"
                        style={{ width: "auto", height: "auto" }}
                    />
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 items-center max-sm:text-center">
                <h3 className="text-xl font-bold text-slate-800">{store.name}</h3>
                <span className="text-xs text-slate-500 font-medium">@{store.username}</span>

                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold px-3 py-0.5 rounded-full capitalize ${
                        store.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : store.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                >
                    {store.status}
                </span>
            </div>

            <p className="text-slate-600 my-3 text-xs sm:text-sm max-w-2xl leading-relaxed">{store.description}</p>

            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                <p className="flex items-center gap-2 max-sm:justify-center"><MapPin size={15} className="shrink-0 text-slate-400" /> <span>{store.address}</span></p>
                <p className="flex items-center gap-2 max-sm:justify-center"><Phone size={15} className="shrink-0 text-slate-400" /> <span>{store.contact}</span></p>
                <p className="flex items-center gap-2 max-sm:justify-center"><Mail size={15} className="shrink-0 text-slate-400" /> <span>{store.email}</span></p>
            </div>

            <p className="text-slate-500 text-xs mt-4 max-sm:text-center">
                Applied on <span className="font-medium">{new Date(store.createdAt).toLocaleDateString()}</span> by
            </p>

            {store.user && (
                <div className="flex items-center gap-2.5 text-xs pt-1 max-sm:justify-center">
                    {store.user.image ? (
                        <Image
                            width={36}
                            height={36}
                            src={store.user.image}
                            alt={store.user.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                            style={{ width: "auto", height: "auto" }}
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                            {store.user.name?.charAt(0) || "U"}
                        </div>
                    )}
                    <div>
                        <p className="text-slate-800 font-semibold">{store.user.name}</p>
                        <p className="text-slate-400 text-[11px]">{store.user.email}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StoreInfo
