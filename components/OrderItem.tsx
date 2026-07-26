'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useAppSelector } from "@/lib/store";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import { OrderWithDetails } from "@/types";

interface OrderItemProps {
    order: OrderWithDetails;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [ratingModal, setRatingModal] = useState<{ orderId: string; productId: string } | null>(null);

    const { ratings } = useAppSelector(state => state.rating);

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems?.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    {item.product?.images?.[0] && (
                                        <Image
                                            className="h-14 w-auto object-contain"
                                            src={item.product.images[0]}
                                            alt="product_img"
                                            width={50}
                                            height={50}
                                            style={{ width: "auto", height: "auto" }}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product?.name}</p>
                                    <p>{currency}{item.price} Qty : {item.quantity} </p>
                                    <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div>
                                        {ratings.find((rating: any) => rating && order.id === rating.orderId && item.product?.id === rating.productId)
                                            ? <Rating value={ratings.find((rating: any) => rating && order.id === rating.orderId && item.product?.id === rating.productId)?.rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product?.id })} className={`text-[#E59500] hover:bg-[#E59500]/10 px-2 py-1 rounded transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }</div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    {order.address && (
                        <>
                            <p>{order.address.name}, {order.address.street},</p>
                            <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
                            <p>{order.address.phone}</p>
                        </>
                    )}
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 ${order.status === 'ORDER_PLACED'
                            ? 'text-yellow-500 bg-yellow-100'
                            : order.status === 'DELIVERED'
                                ? 'text-[#E59500] bg-[#E59500]/10'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    {order.address && (
                        <>
                            <p>{order.address.name}, {order.address.street}</p>
                            <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
                            <p>{order.address.phone}</p>
                        </>
                    )}
                    <br />
                    <div className="flex items-center">
                        <span className='text-center mx-auto px-6 py-1.5 rounded bg-[#E59500]/10 text-[#E59500] font-medium' >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem
