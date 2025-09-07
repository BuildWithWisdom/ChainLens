import React from 'react';

interface LeaderboardTableProps {
  title: string;
  data: {
    address: string;
    tx_count?: number;
    total_volume?: number;
  }[];
  metricLabel: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ title, data, metricLabel }) => {
  return (
    <div className="bg-gray-900/50 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-cyan-400 mb-4">{title}</h3>
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
            {data.map((item, index) => (
              <tr key={item.address} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-2 font-medium">{index + 1}</td>
                <td className="p-2 font-mono text-sm truncate" title={item.address}>{`${item.address.slice(0, 10)}...${item.address.slice(-8)}`}</td>
                <td className="p-2 text-right font-mono text-cyan-300">{
                  item.tx_count?.toLocaleString() || 
                  (item.total_volume ? `${parseFloat(item.total_volume.toString()).toFixed(2)} ETH` : '0')
                }</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
