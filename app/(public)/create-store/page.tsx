"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

export default function CreateStore() {
  const { user } = useUser();
  const router = useRouter();
  const { getToken } = useAuth();

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [storeInfo, setStoreInfo] = useState<{
    name: string;
    username: string;
    description: string;
    email: string;
    contact: string;
    address: string;
    image: any;
  }>({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    image: "",
  });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
  };

  const fetchSellerStatus = async () => {
    const token = await getToken();
    try {
      const { data } = await axios.get("/api/store/create", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (["approved", "rejected", "pending"].includes(data?.status)) {
        setAlreadySubmitted(true);
        setStatus(data.status);
        switch (data.status) {
          case "pending":
            setMessage(
              "Your store request is pending. Please wait for admin to approve your store",
            );
            break;
          case "rejected":
            setMessage(
              "Your store request has been rejected. Contact admin for details.",
            );
            break;
          case "approved":
            setMessage(
              "Your store is approved. You can now add products to your store from the dashboard",
            );
            setTimeout(() => {
              router.push("/store");
            }, 5000);
            break;
        }
      } else {
        setAlreadySubmitted(false);
      }
    } catch (error: any) {
      toast.error(
        getCleanErrorMessage(
          error,
          "Error while fetching your store status.",
        ),
      );
    }

    setLoading(false);
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      return toast("Please login to continue");
    }

    try {
      const token = await getToken();

      const formData = new FormData();

      formData.append("name", storeInfo.name);
      formData.append("username", storeInfo.username);
      formData.append("description", storeInfo.description);
      formData.append("email", storeInfo.email);
      formData.append("contact", storeInfo.contact);
      formData.append("address", storeInfo.address);
      formData.append("image", storeInfo.image);

      const { data } = await axios.post("/api/store/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(data.message);
      setStatus(data.status);
      setAlreadySubmitted(true);
      setMessage(
        "Your store request is pending. Please wait for admin to approve your store",
      );
    } catch (error: any) {
      toast.error(
        getCleanErrorMessage(
          error,
          "Failed to submit store application",
        ),
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        {alreadySubmitted ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Store Application Status: <span className="capitalize">{status}</span>
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">{message}</p>
          </div>
        ) : (
          <form onSubmit={onSubmitHandler} className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Your Store</h1>
            <p className="text-sm text-slate-500 mb-8">
              Start selling your products on Karta today.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                name="name"
                value={storeInfo.name}
                onChange={onChangeHandler}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={storeInfo.username}
                onChange={onChangeHandler}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                value={storeInfo.description}
                onChange={onChangeHandler}
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={storeInfo.email}
                  onChange={onChangeHandler}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  name="contact"
                  value={storeInfo.contact}
                  onChange={onChangeHandler}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                name="address"
                value={storeInfo.address}
                onChange={onChangeHandler}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files?.[0] })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#002642] hover:bg-[#840032] text-white font-semibold rounded-lg transition"
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
