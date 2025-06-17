"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from "chart.js"
import { Bar, Pie } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface ProductChartProps {
  data: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  type?: "pie" | "bar"
  onProductClick?: (productName: string) => void
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
]

export default function ProductChart({ data, type = "bar", onProductClick }: ProductChartProps) {
  const chartRef = useRef<ChartJS>(null)

  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString()}`
  }

  // Take top 8 products for better visualization
  const chartData = data.slice(0, 8)

  // Prepare chart data
  const chartDataConfig = {
    labels: chartData.map((item) => item.name),
    datasets: [
      {
        label: type === "pie" ? "รายได้" : "รายได้",
        data: chartData.map((item) => item.revenue),
        backgroundColor: type === "pie" ? COLORS.slice(0, chartData.length) : "#3B82F6",
        borderColor: type === "pie" ? COLORS.slice(0, chartData.length) : "#3B82F6",
        borderWidth: type === "pie" ? 2 : 1,
        hoverBackgroundColor: type === "pie" ? COLORS.slice(0, chartData.length) : "#2563EB",
        hoverBorderColor: type === "pie" ? "#ffffff" : "#2563EB",
        hoverBorderWidth: type === "pie" ? 3 : 2,
      },
    ],
  }

  // Chart options for Bar chart
  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#3B82F6",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            const quantity = chartData[context.dataIndex]?.quantity || 0
            return [`รายได้: ${formatCurrency(value)}`, `จำนวนขาย: ${quantity} ชิ้น`]
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onProductClick) {
        const index = elements[0].index
        const productName = chartData[index]?.name
        if (productName) {
          onProductClick(productName)
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "สินค้า",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "รายได้ (บาท)",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value) => formatCurrency(value as number),
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  }

  // Chart options for Pie chart
  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i] as number
                const total = (dataset.data as number[]).reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor?.[i] || COLORS[i],
                  strokeStyle: dataset.borderColor?.[i] || COLORS[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                }
              })
            }
            return []
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#3B82F6",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.parsed
            const quantity = chartData[context.dataIndex]?.quantity || 0
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)

            return [`รายได้: ${formatCurrency(value)}`, `จำนวนขาย: ${quantity} ชิ้น`, `สัดส่วน: ${percentage}%`]
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onProductClick) {
        const index = elements[0].index
        const productName = chartData[index]?.name
        if (productName) {
          onProductClick(productName)
        }
      }
    },
  }

  if (type === "pie") {
    return (
      <div style={{ height: "300px", width: "100%" }}>
        <Pie ref={chartRef} data={chartDataConfig} options={pieOptions} />
      </div>
    )
  }

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar ref={chartRef} data={chartDataConfig} options={barOptions} />
    </div>
  )
}
