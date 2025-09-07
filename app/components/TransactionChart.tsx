import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { api } from '../lib/api';
import SkeletonLoader from './SkeletonLoader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function TransactionChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const volumeData = await api.getTransactionVolume();
        
        const labels = volumeData.map((d: any) => new Date(d.hour));
        const dataPoints = volumeData.map((d: any) => d.transaction_count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Transactions',
              data: dataPoints,
              borderColor: 'rgb(6, 182, 212)', // cyan-500
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        });
        setError(null);
      } catch (e) {
        setError("Could not load transaction chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937', // gray-800
        titleColor: '#e5e7eb', // gray-200
        bodyColor: '#d1d5db', // gray-300
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
          tooltipFormat: 'MMM d, h a',
          displayFormats: {
            hour: 'h a',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af', // gray-400
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af', // gray-400
          stepSize: 1, // Show whole numbers for transaction counts
        },
      },
    },
  };

  return (
    <section className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4">Transaction Volume (24h)</h3>
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4 h-64 flex items-center justify-center">
        {loading ? (
          <SkeletonLoader className="h-full w-full" />
        ) : error ? (
          <div className="text-center text-rose-300">{error}</div>
        ) : chartData ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="text-center text-gray-400">No chart data available.</div>
        )}
      </div>
    </section>
  );
}
