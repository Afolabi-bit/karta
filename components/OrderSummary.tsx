'use client'
import { PlusIcon, SquarePenIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import AddressModal from "./AddressModal";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { Address, Coupon } from "@/types";

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

interface OrderSummaryProps {
  totalPrice: number;
  items: any[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalPrice, items }) => {
  const { isLoaded, has } = useAuth();
  const isPlus = Boolean(isLoaded && has && has({ plan: "plus" }));

  const dispatch = useAppDispatch();
  const { user } = useUser();
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();

  const addressList = useAppSelector((state) => state.address.list);

  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [couponCodeInput, setCouponCodeInput] = useState<string>("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const handleCouponCode = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (!user) return toast.error("Please login to proceed");

      const token = await getToken();

      const { data } = await axios.post(
        "/api/coupon",
        { code: couponCodeInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCoupon(data.coupon);
      toast.success("Coupon applied successfully");
    } catch (error: any) {
      toast.error(getCleanErrorMessage(error, "Failed to apply coupon"));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user) throw new Error("Please login to place an order");
      if (!selectedAddress) throw new Error("Please select an address");
      if (!paymentMethod) throw new Error("Please select a payment method");
      if (!items || items.length === 0) throw new Error("No items to order");

      const token = await getToken();

      const orderData: any = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
      };

      if (coupon) {
        orderData.couponCode = coupon.code;
      }

      const { data } = await axios.post("/api/order", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (paymentMethod === "STRIPE") {
        dispatch(clearCart());
        window.location.href = data.session.url;
      } else {
        toast.success(data.message);
        router.push("/orders");
        dispatch(clearCart());
      }
    } catch (error: any) {
      toast.error(getCleanErrorMessage(error, "Failed to place order"));
    }
  };

  const discountAmount = coupon ? (totalPrice * coupon.discount) / 100 : 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      {/* Address Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-medium text-sm">Shipping Address</p>
          <button
            onClick={() => setShowAddressModal(true)}
            className="text-xs text-[#E59500] hover:underline flex items-center gap-1"
          >
            <PlusIcon size={14} /> Add Address
          </button>
        </div>

        {addressList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No address saved yet</p>
        ) : (
          <div className="space-y-2">
            {addressList.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition ${
                  selectedAddress?.id === addr.id
                    ? "border-[#E59500] bg-white shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white/50"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress?.id === addr.id}
                  onChange={() => setSelectedAddress(addr)}
                  className="mt-0.5 accent-[#E59500]"
                />
                <div>
                  <p className="font-medium text-slate-800">{addr.name}</p>
                  <p className="text-slate-500">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                  <p className="text-slate-500">{addr.phone}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Coupon Code */}
      <form onSubmit={handleCouponCode} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Promo code"
          value={couponCodeInput}
          onChange={(e) => setCouponCodeInput(e.target.value)}
          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded outline-none focus:border-[#E59500]"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-900 transition"
        >
          Apply
        </button>
      </form>

      {coupon && (
        <div className="flex justify-between items-center text-xs text-green-600 bg-green-50 p-2 rounded mb-4">
          <span>Coupon {coupon.code} applied ({coupon.discount}% off)</span>
          <button onClick={() => setCoupon(null)}><XIcon size={14} /></button>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 text-sm border-t border-b border-slate-200 py-4 mb-6">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span>{currency}{totalPrice.toFixed(2)}</span>
        </div>
        {coupon && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{currency}{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
          <span>Total</span>
          <span>{currency}{finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <p className="font-medium text-sm mb-3">Payment Method</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setPaymentMethod("COD")}
            className={`p-3 rounded-lg border font-medium transition ${
              paymentMethod === "COD"
                ? "border-[#E59500] bg-white text-[#002642]"
                : "border-slate-200 bg-white/50 text-slate-600"
            }`}
          >
            Cash on Delivery
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("STRIPE")}
            className={`p-3 rounded-lg border font-medium transition ${
              paymentMethod === "STRIPE"
                ? "border-[#E59500] bg-white text-[#002642]"
                : "border-slate-200 bg-white/50 text-slate-600"
            }`}
          >
            Stripe / Card
          </button>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="w-full py-3 bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold text-sm rounded-lg shadow-md transition active:scale-98"
      >
        Place Order
      </button>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </div>
  );
};

export default OrderSummary;
