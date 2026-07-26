"use client";
import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { getToken } = useAuth();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number;
    totalEarnings: number;
    totalOrders: number;
    ratings: any[];
  }>({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
  });

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: dashboardData?.totalProducts ?? 0,
      icon: ShoppingBasketIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Earnings",
      value: currency + (dashboardData?.totalEarnings ?? 0).toLocaleString(),
      icon: CircleDollarSignIcon,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Orders",
      value: dashboardData?.totalOrders ?? 0,
      icon: TagsIcon,
      color: "bg-amber-50 text-[#E59500]",
    },
    {
      title: "Total Ratings",
      value: dashboardData?.ratings?.length ?? 0,
      icon: StarIcon,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(data.dashboardData);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setHasError(true);
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to load seller dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  if (hasError) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Unable to load dashboard
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          We encountered an issue retrieving your seller metrics. Please try again.
        </p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2.5 bg-[#002642] hover:bg-[#840032] text-white font-medium text-sm rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 mb-20 sm:mb-28 text-slate-500">
      <div className="mb-6">
        <h1 className="text-2xl text-slate-500">
          Seller <span className="text-slate-800 font-semibold">Dashboard</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Overview of your store performance and customer feedback
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {dashboardCardsData.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between border border-slate-200 p-4 rounded-xl bg-white shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 truncate">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full shrink-0 ${card.color}`}>
                <IconComponent size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ratings Section */}
      {dashboardData.ratings && dashboardData.ratings.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-lg text-slate-800 font-semibold mb-4">Recent Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.ratings.map((rating: any, index: number) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-xl flex items-start gap-3.5 bg-white shadow-xs"
              >
                {rating.user?.image ? (
                  <Image
                    src={rating.user.image}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                    style={{ width: "auto", height: "auto" }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                    {rating.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {rating.user?.name || "Customer"}
                    </p>
                    <span className="text-xs text-[#E59500] font-bold shrink-0">
                      ★ {rating.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {rating.review}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
          No customer reviews received yet. Reviews will appear here once buyers rate your products.
        </div>
      )}
    </div>
  );
}
