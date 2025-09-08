import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import classnames from 'classnames';

import SkeletonLoader from './SkeletonLoader';

interface LeaderboardProps {
  limit: number;
  isHomepage?: boolean; // New prop
}

type Tab = 'senders' | 'receivers' | 'volume';
type TimeFilter = 1 | 7 | 30;

const NewLeaderboard: React.FC<LeaderboardProps> = ({ limit, isHomepage }) => {
  const [activeTab, setActiveTab] = useState<Tab>('senders');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(7);
  const [data, setData] = useState<Record<Tab, any[]>>({
    senders: [],
    receivers: [],
    volume: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [senders, receivers, volume] = await Promise.all([
          api.getTopSenders(limit, timeFilter),
          api.getTopReceivers(limit, timeFilter),
          api.getTopVolume(limit, timeFilter),
        ]);
        setData({ senders, receivers, volume });
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setError("Could not load leaderboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit, timeFilter]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 items-center p-2">
              <SkeletonLoader className="h-5 w-5 rounded-full" />
              <SkeletonLoader className="h-5 w-3/4" />
              <SkeletonLoader className="h-5 w-1/2 justify-self-end" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }

    const tableData = data[activeTab];
    const metricLabel = activeTab === 'volume' ? 'Total Volume' : 'Transactions';

    if (tableData.length === 0) {
      return <p className="text-center text-gray-400">No data available for this period.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Rank</th>
              <th className="p-2">Address</th>
              <th className="p-2 text-right">{metricLabel}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              item.address && (
                <tr key={item.address} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-2 font-medium">{index + 1}</td>
                  <td className="p-2 font-mono text-sm truncate">
                    <a href={`/address/${item.address}`} className="text-cyan-300 hover:underline" title={item.address}>
                      {`${item.address.slice(0, 10)}...${item.address.slice(-8)}`}
                    </a>
                  </td>
                  <td className="p-2 text-right font-mono text-cyan-300">{
                    item.tx_count?.toLocaleString() || 
                    (item.total_volume ? `${parseFloat(item.total_volume.toString()).toFixed(2)} ETH` : '0')
                  }</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 rounded-xl shadow-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-cyan-400">Leaderboards</h3>
        <div className="flex items-center gap-4">
          <div className={classnames("flex items-center gap-2 text-sm", { "hidden sm:flex": isHomepage })}>
            <button onClick={() => setTimeFilter(1)} className={classnames('px-1.5 py-1 sm:px-3 sm:py-1 rounded-md', { 'bg-cyan-500/90 text-gray-900': timeFilter === 1, 'bg-gray-800/50 hover:bg-gray-700/50': timeFilter !== 1 })}>24H</button>
            <button onClick={() => setTimeFilter(7)} className={classnames('px-1.5 py-1 sm:px-3 sm:py-1 rounded-md', { 'bg-cyan-500/90 text-gray-900': timeFilter === 7, 'bg-gray-800/50 hover:bg-gray-700/50': timeFilter !== 7 })}>7D</button>
            <button onClick={() => setTimeFilter(30)} className={classnames('px-1.5 py-1 sm:px-3 sm:py-1 rounded-md', { 'bg-cyan-500/90 text-gray-900': timeFilter === 30, 'bg-gray-800/50 hover:bg-gray-700/50': timeFilter !== 30 })}>30D</button>
          </div>
          {limit <= 5 && (
              <a href="/leaderboard" className="inline-flex items-center rounded-md bg-cyan-500/90 hover:bg-cyan-400 px-3 py-1 text-sm font-medium text-gray-900">View All</a>
          )}
        </div>
      </div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('senders')}
            className={classnames(
              'px-3 py-2 font-medium text-sm rounded-t-md',
              {
                'bg-gray-800 text-cyan-400': activeTab === 'senders',
                'text-gray-400 hover:text-white': activeTab !== 'senders',
              }
            )}
          >
            Top Senders
          </button>
          <button
            onClick={() => setActiveTab('receivers')}
            className={classnames(
              'px-3 py-2 font-medium text-sm rounded-t-md',
              {
                'bg-gray-800 text-cyan-400': activeTab === 'receivers',
                'text-gray-400 hover:text-white': activeTab !== 'receivers',
              }
            )}
          >
            Top Receivers
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={classnames(
              'px-3 py-2 font-medium text-sm rounded-t-md',
              {
                'bg-gray-800 text-cyan-400': activeTab === 'volume',
                'text-gray-400 hover:text-white': activeTab !== 'volume',
              }
            )}
          >
            Top Volume
          </button>
        </nav>
      </div>
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default NewLeaderboard;
