"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Container } from "@/components/ui/container";

// Mock stock data - in production, this would come from an API
const generateStockData = () => {
  const dates = [];
  const basePrice = 150;
  let currentPrice = basePrice;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.45) * 5; // Slight upward bias
    currentPrice = Math.max(100, currentPrice + change);
    
    dates.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 5000000 + 2000000),
    });
  }
  
  return dates;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-sm text-muted-foreground">
          Price: <span className="text-foreground font-semibold">${payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function StockCharts() {
  const [stockData, setStockData] = useState<Array<{ date: string; price: number; volume: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStockData(generateStockData());
  }, []);

  if (!mounted || stockData.length === 0) {
    return (
      <section className="relative py-12 md:py-16 bg-background z-10">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Market Performance
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real-time insights and trends across key market indicators
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#b6cae2]/40 dark:bg-[#b6cae2]/30 backdrop-blur-md border border-border/50 rounded-lg p-6 shadow-sm h-[350px] animate-pulse" />
            <div className="bg-[#b6cae2]/40 dark:bg-[#b6cae2]/30 backdrop-blur-md border border-border/50 rounded-lg p-6 shadow-sm h-[350px] animate-pulse" />
          </div>
        </Container>
      </section>
    );
  }

  const latestPrice = stockData[stockData.length - 1].price;
  const previousPrice = stockData[stockData.length - 2].price;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);

  return (
    <section className="relative py-12 md:py-16 bg-background z-10">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Market Performance
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time insights and trends across key market indicators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Stock Price Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-background border border-border rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Market Index</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">${latestPrice.toFixed(2)}</span>
                  <span
                    className={`text-sm font-medium flex items-center gap-1 ${
                      priceChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {priceChange >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(priceChange).toFixed(2)} ({priceChangePercent}%)
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={11}
                  tick={{ fill: "#6b7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tick={{ fill: "#6b7280" }}
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Market Performance Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-background border border-border rounded-lg p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">30-Day Performance</h3>
              <p className="text-sm text-muted-foreground">Cumulative returns</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stockData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={11}
                  tick={{ fill: "#6b7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
