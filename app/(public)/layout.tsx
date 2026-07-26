"use client";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const { user } = useUser();
  const { getToken } = useAuth();

  const { cartItems } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart({ getToken }));
      dispatch(fetchAddress({ getToken }));
      dispatch(fetchUserRatings({ getToken }));
    }
  }, [user, dispatch, getToken]);

  useEffect(() => {
    if (user) {
      dispatch(uploadCart({ getToken }));
    }
  }, [cartItems, user, dispatch, getToken]);

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
