import React from 'react';
import NewLeaderboard from '../components/NewLeaderboard';
import Navbar from '../components/Navbar';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <NewLeaderboard limit={100} />
      </main>
    </div>
  );
}
