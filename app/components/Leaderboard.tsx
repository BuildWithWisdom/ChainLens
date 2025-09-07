import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import LeaderboardTable from './LeaderboardTable';

const Leaderboard: React.FC = () => {
  const [topSenders, setTopSenders] = useState<any[]>([]);
  const [topReceivers, setTopReceivers] = useState<any[]>([]);
  const [topVolume, setTopVolume] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [senders, receivers, volume] = await Promise.all([
          api.getTopSenders(5),
          api.getTopReceivers(5),
          api.getTopVolume(5),
        ]);
        setTopSenders(senders);
        setTopReceivers(receivers);
        setTopVolume(volume);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading Leaderboards...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LeaderboardTable title="Top Senders" data={topSenders} metricLabel="Transactions" />
        <LeaderboardTable title="Top Receivers" data={topReceivers} metricLabel="Transactions" />
        <LeaderboardTable title="Top Volume" data={topVolume} metricLabel="Total Volume" />
      </div>
      <div className="text-center mt-6">
        <a href="/leaderboard" className="inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-6 py-3 text-lg font-medium text-gray-900">View Full Leaderboards</a>
      </div>
    </div>
  );
};

export default Leaderboard;
