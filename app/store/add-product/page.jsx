"use client";
import { assets } from "@/assets/assets";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
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

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
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

  const onChangeHandler = (e) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const compressImageForAI = (file) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result;
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
        ctx.drawImage(img, 0, 0, width, height);

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

  const handleImageUpload = async (key, file) => {
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
          ),
          {
            loading: "Analyzing image with AI...",
            success: (res) => {
              const data = res.data;
              if (data.name && data.description) {
                setProductInfo((prev) => ({
                  ...prev,
                  name: data.name,
                  description: data.description,
                }));
                setAiUsed(true);

                return "Image analyzed successfully";
              }
              return "Could not analyze image";
            },
            error: (err) => {
              if (err.response?.status === 413) {
                return "Image size is too large. Please select a smaller image.";
              }
              const errorMsg = err.response?.data?.error;
              if (typeof errorMsg === "string") {
                return errorMsg;
              }
              return "Failed to analyze image. Please try again.";
            },
          },
        );
      } catch (error) {
        console.error("Error processing image for AI:", error);
      }
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!images[1] && !images[2] && !images[3] && !images[4]) {
      return toast.error("Please upload at least one product image");
    }

    if (!productInfo.name.trim()) {
      return toast.error("Please enter a product name");
    }

    if (!productInfo.description.trim()) {
      return toast.error("Please enter a product description");
    }

    const numericMrp = Number(productInfo.mrp);
    if (!productInfo.mrp || isNaN(numericMrp) || numericMrp <= 0) {
      return toast.error("Please enter a valid actual price greater than 0");
    }

    let numericPrice = numericMrp;
    if (
      productInfo.price !== "" &&
      productInfo.price !== null &&
      productInfo.price !== undefined
    ) {
      const parsedPrice = Number(productInfo.price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return toast.error("Please enter a valid offer price");
      }
      if (parsedPrice > numericMrp) {
        return toast.error("Offer price cannot be greater than actual price");
      }
      numericPrice = parsedPrice;
    }

    if (!productInfo.category) {
      return toast.error("Please select a category");
    }

    setLoading(true);

    try {
      await toast.promise(
        (async () => {
          const formData = new FormData();
          formData.append("name", productInfo.name.trim());
          formData.append("description", productInfo.description.trim());
          formData.append("mrp", numericMrp);
          formData.append("price", numericPrice);
          formData.append("category", productInfo.category);

          Object.keys(images).forEach((key) => {
            images[key] && formData.append("images", images[key]);
          });

          const token = await getToken();

          const { data } = await axios.post("/api/store/product", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setProductInfo({
            name: "",
            description: "",
            mrp: "",
            price: "",
            category: "",
          });
          setImages({ 1: null, 2: null, 3: null, 4: null });
          setAiUsed(false);

          return data.message || "Product added successfully";
        })(),
        {
          loading: "Adding Product...",
          success: (msg) => msg,
          error: (err) =>
            err?.response?.data?.error ||
            err?.message ||
            "Failed to add product",
        },
      );
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
      <h1 className="text-2xl">
        Add New <span className="text-slate-800 font-medium">Products</span>
      </h1>
      <p className="mt-7">Product Images</p>

      <div className="flex gap-3 mt-4">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`images${key}`}>
            <Image
              width={300}
              height={300}
              className="h-15 w-auto border border-slate-200 rounded cursor-pointer"
              src={
                images[key]
                  ? URL.createObjectURL(images[key])
                  : assets.upload_area
              }
              alt=""
            />
            <input
              type="file"
              accept="image/*"
              id={`images${key}`}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(key, e.target.files[0]);
                }
                e.target.value = "";
              }}
              hidden
            />
          </label>
        ))}
      </div>

      <label htmlFor="" className="flex flex-col gap-2 my-6 ">
        Name
        <input
          type="text"
          name="name"
          onChange={onChangeHandler}
          value={productInfo.name}
          placeholder="Enter product name"
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded"
          required
        />
      </label>

      <label htmlFor="" className="flex flex-col gap-2 my-6 ">
        Description
        <textarea
          name="description"
          onChange={onChangeHandler}
          value={productInfo.description}
          placeholder="Enter product description"
          rows={5}
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none"
          required
        />
      </label>

      <div className="flex gap-5">
        <label htmlFor="" className="flex flex-col gap-2 ">
          Actual Price ($)
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="mrp"
            onChange={onChangeHandler}
            value={productInfo.mrp}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </label>
        <label htmlFor="" className="flex flex-col gap-2 ">
          Offer Price ($)
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            onChange={onChangeHandler}
            value={productInfo.price}
            placeholder="0 (optional)"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
          />
        </label>
      </div>

      <select
        onChange={(e) =>
          setProductInfo({ ...productInfo, category: e.target.value })
        }
        value={productInfo.category}
        className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded"
        required
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <br />

      <button
        disabled={loading}
        className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition"
      >
        Add Product
      </button>
    </form>
  );
}
