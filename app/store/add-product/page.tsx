"use client";
import { assets } from "@/assets/assets";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function StoreAddProduct() {
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Health",
    "Toys & Games",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Drink",
    "Hobbies & Crafts",
    "Others",
  ];

  const [images, setImages] = useState<Record<number, File | null>>({ 1: null, 2: null, 3: null, 4: null });
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    mrp: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const { getToken } = useAuth();

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const compressImageForAI = (file: File): Promise<{ base64Image: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const mimeType = "image/jpeg";
        const base64Image = dataUrl.split(",")[1];

        resolve({ base64Image, mimeType });
      };

      img.onerror = (err) => reject(err);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (key: number, file: File | null) => {
    if (!file) return;
    setImages((prev) => ({ ...prev, [key]: file }));
    if (!aiUsed) {
      try {
        const { base64Image, mimeType } = await compressImageForAI(file);
        const token = await getToken();

        await toast.promise(
          axios.post(
            "/api/store/ai",
            {
              base64Image,
              mimeType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ).then((res) => {
            if (res.data.name && res.data.description) {
              setProductInfo((prev) => ({
                ...prev,
                name: res.data.name,
                description: res.data.description,
              }));
              setAiUsed(true);
            }
          }),
          {
            loading: "AI is analyzing image...",
            success: "AI generated title and description",
            error: "Failed to generate details with AI",
          },
        );
      } catch (error) {
        console.error("AI Error:", error);
      }
    }
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();

      formData.append("name", productInfo.name);
      formData.append("description", productInfo.description);
      formData.append("mrp", productInfo.mrp);
      formData.append("price", productInfo.price);
      formData.append("category", productInfo.category);

      Object.values(images).forEach((file) => {
        if (file) {
          formData.append("images", file);
        }
      });

      const { data } = await axios.post("/api/store/product", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(data.message);
      setProductInfo({
        name: "",
        description: "",
        mrp: "",
        price: "",
        category: "",
      });
      setImages({ 1: null, 2: null, 3: null, 4: null });
      setAiUsed(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="text-slate-700 max-w-4xl mb-28">
      <h1 className="text-2xl text-slate-500 mb-6">
        Add <span className="text-slate-800 font-medium">Product</span>
      </h1>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-2">Product Images</p>
          <div className="flex gap-4 flex-wrap">
            {[1, 2, 3, 4].map((key) => (
              <label key={key} className="cursor-pointer">
                <div className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition overflow-hidden">
                  {images[key] ? (
                    <Image
                      src={URL.createObjectURL(images[key]!)}
                      alt="Product"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image src={assets.upload_area} alt="Upload" width={32} height={32} />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(key, e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={productInfo.name}
            onChange={onChangeHandler}
            placeholder="Type product name here..."
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Description</label>
          <textarea
            name="description"
            value={productInfo.description}
            onChange={onChangeHandler}
            rows={5}
            placeholder="Write product description..."
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={productInfo.category}
              onChange={onChangeHandler}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">MRP ($)</label>
            <input
              type="number"
              name="mrp"
              value={productInfo.mrp}
              onChange={onChangeHandler}
              placeholder="0.00"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Offer Price ($)</label>
            <input
              type="number"
              name="price"
              value={productInfo.price}
              onChange={onChangeHandler}
              placeholder="0.00"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#E59500] text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold text-sm rounded-lg transition shadow-md disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>
    </form>
  );
}
