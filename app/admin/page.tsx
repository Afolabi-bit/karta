"use client";
import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { getToken } = useAuth();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    products: number;
    revenue: string | number;
    orders: number;
    stores: number;
    allOrders: Array<{ createdAt: string; total: number }>;
  }>({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    allOrders: [],
  });

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: dashboardData?.products ?? 0,
      icon: ShoppingBasketIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Revenue",
      value: currency + (typeof dashboardData?.revenue === "number" ? dashboardData.revenue.toLocaleString() : dashboardData?.revenue || 0),
      icon: CircleDollarSignIcon,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Orders",
      value: dashboardData?.orders ?? 0,
      icon: TagsIcon,
      color: "bg-amber-50 text-[#E59500]",
    },
    {
      title: "Total Stores",
      value: dashboardData?.stores ?? 0,
      icon: StoreIcon,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(data.dashboardData);
    } catch (error: any) {
      console.error("Error loading admin dashboard:", error);
      setHasError(true);
      toast.error(error.response?.data?.error || "Unable to load admin metrics");
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
          We encountered an issue retrieving admin metrics. Please try again.
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
          Admin <span className="text-slate-800 font-semibold">Dashboard</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Platform-wide overview of stores, orders, products, and revenue
        </p>
      </div>

      {/* Cards Grid */}
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

      {/* Area Chart Container */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs overflow-x-auto">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Revenue & Orders Trends</h2>
        <OrdersAreaChart allOrders={dashboardData?.allOrders} />
      </div>
    </div>
  );
}
