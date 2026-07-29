"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DeleteIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Coupon } from "@/types";

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

const safeFormatDate = (dateVal: any) => {
  if (!dateVal) return "";
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? "" : format(parsed, "yyyy-MM-dd");
};

export default function AdminCoupons() {
  const { getToken } = useAuth();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCoupon, setNewCoupon] = useState<any>({
    code: "",
    description: "",
    discount: "",
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "",
  });

  const fetchCoupons = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/coupon", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCoupons(data.coupons || []);
    } catch (error: any) {
      console.error(error);
      toast.error(getCleanErrorMessage(error, "Failed to load coupons"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();

      const couponPayload = {
        ...newCoupon,
        discount: Number(newCoupon.discount),
        expiresAt: new Date(newCoupon.expiresAt),
      };

      const { data } = await axios.post(
        "/api/admin/coupon",
        { coupon: couponPayload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      await fetchCoupons();
      setNewCoupon({
        code: "",
        description: "",
        discount: "",
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: "",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(getCleanErrorMessage(error, "Failed to add coupon"));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setNewCoupon({ ...newCoupon, [target.name]: value });
  };

  const deleteCoupon = async (code: string) => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this coupon?",
      );
      if (!confirmDelete) {
        return;
      }
      const token = await getToken();
      const { data } = await axios.delete(`/api/admin/coupon?code=${code}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchCoupons();
      toast.success(data.message);
    } catch (error: any) {
      console.error(error);
      toast.error(getCleanErrorMessage(error, "Failed to delete coupon"));
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 mb-20 sm:mb-28 text-slate-500">
      <div className="mb-6">
        <h1 className="text-2xl text-slate-500">
          Manage <span className="text-slate-800 font-semibold">Coupons</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create and manage discount promo codes for customers
        </p>
      </div>

      {/* Add Coupon Form */}
      <form
        onSubmit={handleAddCoupon}
        className="bg-white border border-slate-200 p-4 sm:p-6 rounded-xl shadow-xs my-6 space-y-4"
      >
        <h2 className="text-base font-semibold text-slate-800">Add New Coupon</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              name="code"
              value={newCoupon.code}
              onChange={handleChange}
              placeholder="e.g. SAVE20"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-[#E59500]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={newCoupon.discount}
              onChange={handleChange}
              placeholder="20"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-[#E59500]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={newCoupon.description}
            onChange={handleChange}
            placeholder="20% off on all orders"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-[#E59500]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            name="expiresAt"
            value={safeFormatDate(newCoupon.expiresAt)}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-[#E59500]"
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              name="forNewUser"
              checked={newCoupon.forNewUser}
              onChange={handleChange}
              className="accent-[#E59500]"
            />
            <span>For New Users</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              name="forMember"
              checked={newCoupon.forMember}
              onChange={handleChange}
              className="accent-[#E59500]"
            />
            <span>For Members</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              name="isPublic"
              checked={newCoupon.isPublic}
              onChange={handleChange}
              className="accent-[#E59500]"
            />
            <span>Show Publicly</span>
          </label>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold text-xs rounded-lg transition shadow-xs"
        >
          Add Coupon
        </button>
      </form>

      {/* Coupons Section */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Active Coupons</h2>
        {coupons.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            No coupons created yet. Use the form above to add your first coupon code.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Expires</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-[#E59500]">{c.code}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{c.discount}%</td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{c.description}</td>
                      <td className="p-3.5 text-xs text-slate-500">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => deleteCoupon(c.code)}
                          className="text-red-500 hover:text-red-700 transition p-1 rounded-md hover:bg-red-50"
                          title="Delete Coupon"
                        >
                          <DeleteIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Zero Horizontal Scroll) */}
            <div className="block md:hidden space-y-3">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#E59500] text-sm">{c.code}</span>
                    <span className="bg-emerald-50 text-emerald-600 font-bold text-xs px-2.5 py-0.5 rounded-full">
                      {c.discount}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                    <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => deleteCoupon(c.code)}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Delete Coupon"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
