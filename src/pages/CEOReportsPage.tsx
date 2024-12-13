// src/pages/CEOReportsPage.tsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getDailyReports, getMonthlyReports } from "../api/reportsAPI";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CEOReportsPage: React.FC = () => {
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const [dailyData, monthlyData] = await Promise.all([
        getDailyReports(),
        getMonthlyReports(),
      ]);
      setDailyCount(dailyData.count);
      setMonthlyCount(monthlyData.count);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const data = {
    labels: ["Daily Appointments", "Monthly Appointments"],
    datasets: [
      {
        label: "Number of Appointments",
        data: [dailyCount, monthlyCount],
        backgroundColor: ["#4ade80", "#60a5fa"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Appointments Report",
      },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">Reports</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="max-w-2xl mx-auto">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CEOReportsPage;
