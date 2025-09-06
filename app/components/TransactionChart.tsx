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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
        setError((e as Error).message);
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

  if (error) {
    return <div className="rounded-2xl border border-rose-900 bg-rose-950 text-rose-300 p-4 mt-8">Error loading chart: {error}</div>;
  }

  if (!chartData) {
    return <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4 mt-8 h-64 animate-pulse"></div>;
  }

  return (
    <section className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4">Transaction Volume (24h)</h3>
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4 h-64">
        <Line options={options} data={chartData} />
      </div>
    </section>
  );
}
