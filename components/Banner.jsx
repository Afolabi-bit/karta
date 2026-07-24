"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export default function Banner() {
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);

  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const isValidCouponCode = (couponObj) => {
    return Boolean(
      couponObj &&
      typeof couponObj.code === "string" &&
      couponObj.code.trim().length > 0,
    );
  };

  const handleDisplayOfferBanner = async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get("/api/coupon", { headers });

      const hasValidCode = isValidCouponCode(data?.coupon);

      if (data?.showBanner && hasValidCode) {
        setCoupon(data.coupon);
        return true;
      }

      setCoupon(null);
      return false;
    } catch (error) {
      console.error("Error checking offer banner display condition:", error);
      setCoupon(null);
      return false;
    }
  };

  useEffect(() => {
    if (isLoaded) {
      handleDisplayOfferBanner().then((shouldDisplay) => {
        setIsOpen(shouldDisplay);
      });
    }
  }, [isLoaded, user]);

  const handleClaim = () => {
    setIsOpen(false);
    const codeToCopy = coupon?.code || "NEW20";
    toast.success("Coupon copied to clipboard!");
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
    }
  };

  return (
    isOpen && (
      <div className="w-full px-6 py-2 font-medium text-sm text-white text-center bg-[#002642] shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <p className="font-semibold tracking-wide">
            {coupon
              ? `Get ${coupon.discount}% OFF on Your First Order! Use code: ${coupon.code}`
              : "Get 20% OFF on Your First Order!"}
          </p>
          <div className="flex items-center space-x-6">
            <button
              onClick={handleClaim}
              type="button"
              className="font-semibold text-white bg-[#E59500] hover:bg-[#CC8400] px-6 py-1.5 rounded-full transition shadow-sm max-sm:hidden"
            >
              Claim Offer
            </button>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="font-normal text-white hover:opacity-80 py-1 rounded-full"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  y="12.532"
                  width="17.498"
                  height="2.1"
                  rx="1.05"
                  transform="rotate(-45.74 0 12.532)"
                  fill="#fff"
                />
                <rect
                  x="12.533"
                  y="13.915"
                  width="17.498"
                  height="2.1"
                  rx="1.05"
                  transform="rotate(-135.74 12.533 13.915)"
                  fill="#fff"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  );
}
