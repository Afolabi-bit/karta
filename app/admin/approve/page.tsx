"use client";
import StoreInfo from "@/components/admin/StoreInfo";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser, useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function AdminApprove() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/approve-store", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStores(data.stores || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to load pending store applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async ({ storeId, status }: { storeId: string; status: string }) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/approve-store",
        {
          storeId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      await fetchStores();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update store application");
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
          Approve <span className="text-slate-800 font-semibold">Stores</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review and approve pending seller store applications
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
              <div className="flex gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 max-md:justify-stretch shrink-0">
                <button
                  onClick={() =>
                    toast.promise(
                      handleApprove({ storeId: store.id, status: "approved" }),
                      { loading: "Approving store..." },
                    )
                  }
                  className="flex-1 md:flex-initial px-5 py-2.5 bg-[#E59500] text-white font-semibold rounded-lg hover:bg-[#CC8400] text-xs transition shadow-xs"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    toast.promise(
                      handleApprove({ storeId: store.id, status: "rejected" }),
                      { loading: "Rejecting store..." },
                    )
                  }
                  className="flex-1 md:flex-initial px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 text-xs transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <p className="text-xl font-semibold text-slate-700 mb-1">No applications pending</p>
          <p className="text-xs text-slate-500">New seller applications will show up here for review.</p>
        </div>
      )}
    </div>
  );
}
