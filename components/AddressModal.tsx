"use client";
import { useAuth } from "@clerk/nextjs";
import { XIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

import { useAppDispatch } from "@/lib/store";
import { addAddress } from "@/lib/features/address/addressSlice";

interface AddressModalProps {
  setShowAddressModal: (show: boolean) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ setShowAddressModal }) => {
  const { getToken } = useAuth();
  const dispatch = useAppDispatch();

  const [address, setAddress] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/address",
        { address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(addAddress(data.newAddress));
      toast.success(data.message);
      setShowAddressModal(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={(e) =>
        toast.promise(handleSubmit(e), { loading: "Adding Address..." })
      }
      className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center"
    >
      <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6 relative bg-white p-6 rounded-xl shadow-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setShowAddressModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <XIcon size={20} />
        </button>
        <h2 className="text-3xl ">
          Add New <span className="font-semibold">Address</span>
        </h2>
        <input
          name="name"
          onChange={handleAddressChange}
          value={address.name}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Enter your name"
          required
        />
        <input
          name="email"
          onChange={handleAddressChange}
          value={address.email}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="email"
          placeholder="Email address"
          required
        />
        <input
          name="street"
          onChange={handleAddressChange}
          value={address.street}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Street"
          required
        />
        <div className="flex gap-4">
          <input
            name="city"
            onChange={handleAddressChange}
            value={address.city}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="City"
            required
          />
          <input
            name="state"
            onChange={handleAddressChange}
            value={address.state}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="State"
            required
          />
        </div>
        <div className="flex gap-4">
          <input
            name="zip"
            onChange={handleAddressChange}
            value={address.zip}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="Zip code"
            required
          />
          <input
            name="country"
            onChange={handleAddressChange}
            value={address.country}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="Country"
            required
          />
        </div>
        <input
          name="phone"
          onChange={handleAddressChange}
          value={address.phone}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Phone number"
          required
        />
        <button
          type="submit"
          className="bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold p-2.5 rounded transition"
        >
          Save Address
        </button>
      </div>
    </form>
  );
};

export default AddressModal;
