"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface SalesChartProps {
  data: Array<{
    date: string
    sales: number
    transactions: number
  }>
  type?: "line" | "bar"
  onDateClick?: (date: string) => void
}

export default function SalesChart({ data, type = "line", onDateClick }: SalesChartProps) {
  const chartRef = useRef<ChartJS>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString()}`
  }

  // Prepare chart data
  const chartData = {
    labels: data.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "ยอดขาย",
        data: data.map((item) => item.sales),
        borderColor: "#3B82F6",
        backgroundColor: type === "bar" ? "#3B82F6" : "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: type === "line",
        tension: 0.4,
      },
      ...(type === "line"
        ? [
            {
              label: "จำนวนธุรกรรม",
              data: data.map((item) => item.transactions),
              borderColor: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: 2,
              pointBackgroundColor: "#10B981",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              fill: false,
              tension: 0.4,
              yAxisID: "y1",
            },
          ]
        : []),
    ],
  }

  // Chart options
  const options: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
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
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            if (label === "ยอดขาย") {
              return `${label}: ${formatCurrency(value)}`
            }
            return `${label}: ${value}`
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onDateClick) {
        const index = elements[0].index
        const originalDate = data[index]?.date
        if (originalDate) {
          onDateClick(originalDate)
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "วันที่",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "ยอดขาย (บาท)",
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
      ...(type === "line"
        ? {
            y1: {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              title: {
                display: true,
                text: "จำนวนธุรกรรม",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          }
        : {}),
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  }

  if (type === "bar") {
    return (
      <div style={{ height: "300px", width: "100%" }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    )
  }

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
