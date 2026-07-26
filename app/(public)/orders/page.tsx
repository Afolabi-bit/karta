"use client";
import PageTitle from "@/components/PageTitle";
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { OrderWithDetails } from "@/types";
import Link from "next/link";

export default function Orders() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const fetchOrders = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setHasError(true);
      toast.error("Unable to load orders right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchOrders();
      } else {
        router.push("/");
      }
    }
  }, [isLoaded, user, getToken, router]);

  if (!isLoaded || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-[70vh] mx-6">
      {hasError ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-700 mb-3">
            Something went wrong
          </h2>
          <p className="text-slate-500 max-w-md mb-6">
            We couldn't retrieve your orders at this time. Please check your connection and try again.
          </p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2.5 bg-[#002642] hover:bg-[#840032] text-white font-medium rounded-full text-sm transition shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="my-20 max-w-7xl mx-auto">
          <PageTitle
            heading="My Orders"
            text={`Showing total ${orders.length} orders`}
            linkText={"Go to home"}
          />

          <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
            <thead>
              <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                <th className="text-left">Product</th>
                <th className="text-center">Total Price</th>
                <th className="text-left">Address</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderItem order={order} key={order.id} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center py-16 text-slate-500">
          <h1 className="text-2xl sm:text-4xl font-semibold text-slate-700 mb-3">
            You have no orders
          </h1>
          <p className="text-slate-500 mb-6">
            Looking for something? Explore our catalog and place your first order!
          </p>
          <Link
            href="/shop"
            className="px-6 py-2.5 bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold rounded-full text-sm transition shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
