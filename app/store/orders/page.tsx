"use client";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

export default function StoreOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { getToken } = useAuth();

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(getCleanErrorMessage(error, "Unable to load store orders"));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = await getToken();
      await axios.post(
        "/api/orders",
        {
          orderId,
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
      toast.success("Order status updated successfully");
    } catch (error: any) {
      toast.error(getCleanErrorMessage(error, "Failed to update order status"));
    }
  };

  const openModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="mb-6">
        <h1 className="text-2xl text-slate-500">
          Store <span className="text-slate-800 font-semibold">Orders</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} received
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-50 ring ring-slate-200 rounded-xl p-8 text-center text-slate-500">
          <p className="font-medium text-slate-700">No orders found</p>
          <p className="text-xs text-slate-500 mt-1">When customers place orders, they will show up here.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-xs border border-gray-200 bg-white">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  {[
                    "Sr. No.",
                    "Customer",
                    "Total",
                    "Payment",
                    "Coupon",
                    "Status",
                    "Date",
                  ].map((heading, i) => (
                    <th key={i} className="px-4 py-3.5">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/80 transition-colors duration-150 cursor-pointer"
                    onClick={() => openModal(order)}
                  >
                    <td className="pl-6 text-[#E59500] font-semibold">{index + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{order.user?.name}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      ${order.total}
                    </td>
                    <td className="px-4 py-3.5">{order.paymentMethod}</td>
                    <td className="px-4 py-3.5">
                      {order.isCouponUsed ? (
                        <span className="bg-[#E59500]/10 text-[#E59500] font-semibold text-xs px-2.5 py-1 rounded-full">
                          {order.coupon?.code}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className="border border-slate-300 rounded-md text-xs font-medium px-2 py-1.5 focus:ring-1 focus:ring-[#E59500] bg-white outline-none"
                      >
                        <option value="ORDER_PLACED">ORDER PLACED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Zero Horizontal Scroll) */}
          <div className="block md:hidden space-y-3">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div
                  className="flex items-start justify-between gap-2 cursor-pointer"
                  onClick={() => openModal(order)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#E59500]">#{index + 1}</span>
                      <h3 className="font-semibold text-slate-800 text-sm">
                        {order.user?.name || "Customer"}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base text-[#002642]">${order.total}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  {order.isCouponUsed && (
                    <span className="bg-[#E59500]/10 text-[#E59500] font-semibold text-[11px] px-2 py-0.5 rounded-full">
                      Coupon: {order.coupon?.code}
                    </span>
                  )}
                  <span className="text-slate-500 text-[11px]">
                    {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal(order)}
                    className="text-xs font-semibold text-[#E59500] hover:underline"
                  >
                    View Details →
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="border border-slate-300 rounded-md text-xs font-medium px-2 py-1 bg-white outline-none focus:border-[#E59500]"
                    >
                      <option value="ORDER_PLACED">PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div
          onClick={closeModal}
          className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Order Details
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold transition"
              >
                ✕
              </button>
            </div>

            {/* Customer Details */}
            <div className="mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1">
              <h3 className="font-semibold text-xs text-[#002642] uppercase tracking-wider mb-1.5">Customer Details</h3>
              <p className="text-xs">
                <span className="text-slate-500 font-medium">Name:</span>{" "}
                {selectedOrder.user?.name}
              </p>
              <p className="text-xs">
                <span className="text-slate-500 font-medium">Email:</span>{" "}
                {selectedOrder.user?.email}
              </p>
              <p className="text-xs">
                <span className="text-slate-500 font-medium">Phone:</span>{" "}
                {selectedOrder.address?.phone}
              </p>
              <p className="text-xs">
                <span className="text-slate-500 font-medium">Address:</span>{" "}
                {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}
              </p>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h3 className="font-semibold text-xs text-[#002642] uppercase tracking-wider mb-2">Ordered Products</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedOrder.orderItems?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <img
                      src={
                        item.product?.images?.[0]?.src || item.product?.images?.[0]
                      }
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-md bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.product?.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      <p className="text-xs font-semibold text-[#E59500]">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Status */}
            <div className="mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1 text-xs">
              <p>
                <span className="text-slate-500 font-medium">Payment Method:</span>{" "}
                {selectedOrder.paymentMethod}
              </p>
              <p>
                <span className="text-slate-500 font-medium">Paid:</span>{" "}
                {selectedOrder.isPaid ? "Yes" : "No"}
              </p>
              {selectedOrder.isCouponUsed && (
                <p>
                  <span className="text-slate-500 font-medium">Coupon:</span>{" "}
                  {selectedOrder.coupon?.code} ({selectedOrder.coupon?.discount}%
                  off)
                </p>
              )}
              <p>
                <span className="text-slate-500 font-medium">Status:</span>{" "}
                <span className="font-semibold text-slate-800">{selectedOrder.status}</span>
              </p>
              <p>
                <span className="text-slate-500 font-medium">Order Date:</span>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
