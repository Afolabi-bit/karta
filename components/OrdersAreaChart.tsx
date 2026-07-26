"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OrdersAreaChartProps {
  allOrders?: Array<{ createdAt: string; total: number }>;
}

export default function OrdersAreaChart({ allOrders }: OrdersAreaChartProps) {
  // Group orders by date
  const ordersPerDay =
    allOrders?.reduce<Record<string, number>>((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0]; // format: YYYY-MM-DD
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

  // Convert to array for Recharts and sort chronologically
  const chartData = Object.entries(ordersPerDay)
    .map(([date, count]) => ({
      date,
      orders: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full max-w-4xl h-52 sm:h-72 lg:h-80 text-xs">
      <div className="flex items-center justify-between mb-3 pt-1">
        <span className="text-xs sm:text-sm font-semibold text-slate-700">Orders Overview</span>
        <h3 className="text-xs font-medium text-slate-500">
          <span className="text-slate-400">Orders /</span> Day
        </h3>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#E59500"
            fill="#E59500"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
