"use client";
import StoreInfo from "@/components/admin/StoreInfo";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

export default function AdminStores() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/stores", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStores(data.stores || []);
    } catch (error: any) {
      toast.error(getCleanErrorMessage(error, "Failed to load stores"));
    } finally {
      setLoading(false);
    }
  };

  const toggleIsActive = async (storeId: string) => {
    // Optimistically update UI state
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId ? { ...s, isActive: !s.isActive } : s,
      ),
    );

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/toggle-store",
        {
          storeId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (typeof data?.isActive === "boolean") {
        setStores((prev) =>
          prev.map((s) =>
            s.id === storeId ? { ...s, isActive: data.isActive } : s,
          ),
        );
      }

      toast.success(data.message || "Store status updated");
    } catch (error: any) {
      // Revert optimistic update on failure
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId ? { ...s, isActive: !s.isActive } : s,
        ),
      );
      toast.error(getCleanErrorMessage(error, "Failed to toggle store status"));
    }
  };

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 mb-20 sm:mb-28 text-slate-500">
      <div className="mb-6">
        <h1 className="text-2xl text-slate-500">
          Live <span className="text-slate-800 font-semibold">Stores</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage active store listings and status across the platform
        </p>
      </div>

      {stores.length ? (
        <div className="flex flex-col gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:items-end justify-between"
            >
              {/* Store Info */}
              <StoreInfo store={store} />

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 max-md:justify-center shrink-0">
                <span className="text-xs font-semibold text-slate-700">
                  {store.isActive ? "Active" : "Inactive"}
                </span>
                <label className="relative inline-flex items-center justify-center cursor-pointer text-gray-900">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={() => toggleIsActive(store.id)}
                    checked={!!store.isActive}
                  />
                  <div className="relative w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-[#E59500] transition-colors duration-200 peer-checked:[&>span]:translate-x-4">
                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out"></span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <p className="text-xl font-semibold text-slate-700 mb-1">No stores available</p>
          <p className="text-xs text-slate-500">Approved stores will appear here.</p>
        </div>
      )}
    </div>
  );
}
