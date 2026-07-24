"use client";
import { assets } from "@/assets/assets";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import CategoriesMarquee from "./CategoriesMarquee";

const Hero = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  return (
    <div className="mx-6">
      <div className="flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10">
        <div className="relative flex-1 flex flex-col bg-linear-to-br from-[#002642] via-[#02040F] to-[#001D33] rounded-3xl xl:min-h-100 group shadow-xl overflow-hidden border border-[#0E3A5D]">
          <div className="p-6 sm:p-16 z-10">
            <div className="inline-flex items-center gap-3 bg-[#840032]/80 backdrop-blur-sm text-white pr-4 p-1 rounded-full text-xs sm:text-sm shadow-xs border border-[#A30D45]/40">
              <span className="bg-[#E59500] px-3 py-1 max-sm:ml-1 rounded-full text-white font-bold text-xs uppercase tracking-wider">
                NEWS
              </span>{" "}
              Free Shipping on Orders Above $50!{" "}
              <ChevronRightIcon
                className="group-hover:translate-x-1 transition-transform"
                size={16}
              />
            </div>
            <h2 className="text-3xl sm:text-5xl leading-[1.2] my-4 font-bold bg-linear-to-r from-white via-slate-100 to-[#E59500] bg-clip-text text-transparent max-w-xs sm:max-w-md tracking-tight">
              Gadgets you'll love. Prices you'll trust.
            </h2>
            <div className="text-slate-300 text-sm font-medium mt-4 sm:mt-8">
              <p className="text-slate-400">Starts from</p>
              <p className="text-3xl font-extrabold text-[#E59500]">
                {currency}4.90
              </p>
            </div>
            <button className="bg-[#E59500] text-white font-semibold text-sm py-3 px-8 sm:py-4 sm:px-10 mt-6 sm:mt-8 rounded-full hover:bg-[#CC8400] hover:shadow-lg hover:scale-102 active:scale-95 transition-all shadow-md">
              LEARN MORE
            </button>
          </div>
          <Image
            className="sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm drop-shadow-2xl opacity-95 group-hover:scale-103 transition duration-500"
            src={assets.hero_model_img}
            alt="Hero model"
          />
        </div>

        <div className="flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm">
          <div className="flex-1 flex items-center justify-between w-full bg-linear-to-r from-[#840032] to-[#5C0023] text-white rounded-3xl p-6 px-8 group shadow-lg border border-[#A30D45]/30 relative overflow-hidden">
            <div className="z-10">
              <p className="text-3xl font-bold bg-linear-to-r from-white to-[#E59500] bg-clip-text text-transparent max-w-40 leading-tight">
                Best products
              </p>
              <p className="flex items-center gap-1.5 mt-4 font-medium text-amber-200 group-hover:text-white transition">
                View more{" "}
                <ArrowRightIcon
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />{" "}
              </p>
            </div>
            <Image
              className="w-32 drop-shadow-md group-hover:scale-108 transition duration-300"
              src={assets.hero_product_img1}
              alt="Best products"
            />
          </div>

          <div className="flex-1 flex items-center justify-between w-full bg-linear-to-r from-[#002642] to-[#02040F] text-white rounded-3xl p-6 px-8 group shadow-lg border border-[#0E3A5D] relative overflow-hidden">
            <div className="z-10">
              <p className="text-3xl font-bold bg-linear-to-r from-white to-sky-300 bg-clip-text text-transparent max-w-40 leading-tight">
                20% discounts
              </p>
              <p className="flex items-center gap-1.5 mt-4 font-medium text-sky-200 group-hover:text-white transition">
                View more{" "}
                <ArrowRightIcon
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />{" "}
              </p>
            </div>
            <Image
              className="w-32 drop-shadow-md group-hover:scale-108 transition duration-300"
              src={assets.hero_product_img2}
              alt="Discounts"
            />
          </div>
        </div>
      </div>
      <CategoriesMarquee />
    </div>
  );
};

export default Hero;
