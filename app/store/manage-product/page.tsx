"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import TableSkeleton from "@/components/TableSkeleton";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { ProductWithDetails } from "@/types";
import Link from "next/link";

export default function StoreManageProducts() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/product", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(
        (data.products || []).sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setHasError(true);
      toast.error(
        error?.response?.data?.error ||
          "Unable to load store products. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId: string) => {
    // Optimistically toggle inStock in local UI state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inStock: !p.inStock } : p,
      ),
    );

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/store/stock-toggle",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (typeof data?.inStock === "boolean") {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, inStock: data.inStock } : p,
          ),
        );
      }

      toast.success(data.message || "Stock status updated");
    } catch (error: any) {
      // Revert optimistic update on error
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, inStock: !p.inStock } : p,
        ),
      );
      toast.error(
        error?.response?.data?.error || "Failed to update product stock status.",
      );
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  if (hasError) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Unable to load products
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          We encountered an issue retrieving your products list. Please try again.
        </p>
        <button
          onClick={fetchProducts}
          className="px-6 py-2.5 bg-[#002642] hover:bg-[#840032] text-white font-medium text-sm rounded-lg transition shadow-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-slate-500">
            Manage <span className="text-slate-800 font-semibold">Products</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} listed in your store
          </p>
        </div>
        <Link
          href="/store/add-product"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold text-xs rounded-lg transition shadow-xs self-start sm:self-auto"
        >
          + Add New Product
        </Link>
      </div>

      {loading ? (
        <div className="overflow-x-auto ring ring-slate-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <tbody className="text-slate-700">
              <TableSkeleton rows={5} />
            </tbody>
          </table>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-50 ring ring-slate-200 rounded-xl p-8 text-center text-slate-500">
          <p className="font-medium mb-2 text-slate-700">No products added yet</p>
          <p className="text-xs text-slate-500 mb-4">Start selling by adding your first product to your store.</p>
          <Link
            href="/store/add-product"
            className="inline-block px-5 py-2 bg-[#E59500] hover:bg-[#CC8400] text-white font-semibold text-xs rounded-lg transition"
          >
            Create Product
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto ring ring-slate-200 rounded-lg bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Description</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">MRP</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5 text-center">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex gap-3 items-center">
                        {product.images[0] && (
                          <div className="w-10 h-10 rounded-md bg-slate-100 p-0.5 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                            <Image
                              width={40}
                              height={40}
                              className="w-full h-full object-cover rounded-xs"
                              src={product.images[0]}
                              alt={product.name}
                              style={{ width: "auto", height: "auto" }}
                            />
                          </div>
                        )}
                        <span className="font-medium text-slate-800 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-slate-500 hidden md:table-cell truncate">
                      {product.description}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">
                      {currency}{product.mrp.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {currency}{product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <label className="relative inline-flex items-center justify-center cursor-pointer text-gray-900">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          onChange={() => toggleStock(product.id)}
                          checked={!!product.inStock}
                        />
                        <div className="relative w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-[#E59500] transition-colors duration-200 peer-checked:[&>span]:translate-x-4">
                          <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out"></span>
                        </div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex gap-3 items-center">
                  {product.images[0] && (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                      <Image
                        width={56}
                        height={56}
                        className="w-full h-full object-cover rounded-md"
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-[#002642]">
                        {currency}{product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {currency}{product.mrp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-medium">
                    Status:{" "}
                    <span className={product.inStock ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-2">
                    <span className="text-xs font-medium text-slate-500">Stock</span>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onChange={() => toggleStock(product.id)}
                      checked={!!product.inStock}
                    />
                    <div className="relative w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-[#E59500] transition-colors duration-200 peer-checked:[&>span]:translate-x-4">
                      <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out"></span>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
