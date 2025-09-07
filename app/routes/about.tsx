import React from 'react';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="prose prose-invert lg:prose-xl mx-auto">
          <h1>About Chainlens</h1>
          <p>
            Chainlens is a powerful, real-time blockchain explorer designed specifically for the Somnia network. It addresses the critical need for transparent and user-friendly access to on-chain activity, providing unparalleled visibility into transactions, network throughput, and key trends.
          </p>
          <p>
            Our primary motivation for building Chainlens is to empower Somnia builders and users with a practical tool that enhances trust, usability, and ultimately, the adoption of the network. By making on-chain activity visible and accessible, Chainlens lowers the barrier for both technical and non-technical users to engage with Somnia.
          </p>
          <h2>Features</h2>
          <ul>
            <li>Real-time Transaction Feed</li>
            <li>Detailed Transaction View</li>
            <li>Intelligent Search & Filtering</li>
            <li>Network Analytics Dashboard</li>
            <li>Transaction Volume Chart</li>
            <li>User-Friendly Interface</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
