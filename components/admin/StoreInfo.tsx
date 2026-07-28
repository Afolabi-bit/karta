'use client';
import Image from "next/image";
import { MapPin, Mail, Phone, CalendarIcon } from "lucide-react";

interface StoreInfoProps {
    store: any;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ store }) => {
    return (
        <div className="flex-1 text-sm space-y-4 w-full">
            {/* Header: Logo, Name, Handle, Status */}
            <div className="flex items-start gap-3.5">
                {store.logo ? (
                    <Image
                        width={64}
                        height={64}
                        src={store.logo}
                        alt={store.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full shadow-xs border border-slate-200 shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg shrink-0">
                        {store.name?.charAt(0) || "S"}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{store.name}</h3>
                        <span className="text-xs text-slate-400 font-medium">@{store.username}</span>
                        <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                                store.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : store.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                        >
                            {store.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{store.description}</p>
                </div>
            </div>

            {/* Contact & Location Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600">
                <p className="flex items-center gap-2 truncate">
                    <MapPin size={14} className="shrink-0 text-[#E59500]" />
                    <span className="truncate">{store.address || "N/A"}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                    <Phone size={14} className="shrink-0 text-[#E59500]" />
                    <span className="truncate">{store.contact || "N/A"}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                    <Mail size={14} className="shrink-0 text-[#E59500]" />
                    <span className="truncate">{store.email || "N/A"}</span>
                </p>
            </div>

            {/* Applicant User Info */}
            {store.user && (
                <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 px-3.5 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {store.user.image ? (
                            <Image
                                width={32}
                                height={32}
                                src={store.user.image}
                                alt={store.user.name || "User"}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                                {store.user.name?.charAt(0) || "U"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-slate-800 font-semibold truncate">{store.user.name}</p>
                            <p className="text-slate-400 text-[11px] truncate">{store.user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                        <CalendarIcon size={12} />
                        <span>{new Date(store.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreInfo;
