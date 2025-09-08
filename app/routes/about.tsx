import React from 'react';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          <h1 className="text-4xl font-bold text-cyan-400 mb-6 text-center">About Chainlens</h1>
          <section className="space-y-4">
            <h2 className="text-3xl font-semibold text-white">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our mission is to empower Somnia builders and users with a practical, intuitive, and transparent tool that enhances trust, usability, and ultimately, the adoption of the network. By making on-chain activity visible and accessible, Chainlens lowers the barrier for both technical and non-technical users to engage with Somnia.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-semibold text-white">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg space-y-3">
                <h3 className="text-xl font-semibold text-cyan-400">Real-time Transaction Feed</h3>
                <p className="text-gray-300 leading-relaxed">Stay updated with the latest transactions as they happen on the Somnia network. Our real-time feed provides instant insights into network activity, ensuring you never miss a beat.</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg space-y-3">
                <h3 className="text-xl font-semibold text-cyan-400">Detailed Transaction View</h3>
                <p className="text-gray-300 leading-relaxed">Dive deep into every transaction with comprehensive details including sender, receiver, value, gas usage, block number, and more. Understand the full context of each on-chain event.</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg space-y-3">
                <h3 className="text-xl font-semibold text-cyan-400">Intelligent Search & Filtering</h3>
                <p className="text-gray-300 leading-relaxed">Easily find specific transactions, addresses, or blocks using our powerful search and filtering capabilities. Refine your queries to pinpoint exactly what you're looking for.</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg space-y-3">
                <h3 className="text-xl font-semibold text-cyan-400">Network Analytics Dashboard</h3>
                <p className="text-gray-300 leading-relaxed">Gain valuable insights into the health and performance of the Somnia network. Monitor key metrics like Transactions Per Second (TPS), blocks per minute, and active addresses through our intuitive analytics dashboard.</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg space-y-3">
                <h3 className="text-xl font-semibold text-cyan-400">Transaction Volume Chart</h3>
                <p className="text-gray-300 leading-relaxed">Visualize network activity over time with our interactive transaction volume chart. Identify trends and patterns in network usage at a glance.</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg space-y-3">
                <h3 className="text-xl font-semibold text-cyan-400">User-Friendly Interface</h3>
                <p className="text-gray-300 leading-relaxed">Navigate the complexities of blockchain data with ease. Chainlens is designed with a clean, intuitive interface that makes exploring the Somnia network accessible to everyone, regardless of technical expertise.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold text-white">Roadmap & Future Plans</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              We are continuously working to enhance Chainlens and provide even more valuable insights into the Somnia network. Our future plans include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Advanced analytics and reporting tools.</li>
              <li>User accounts and personalized dashboards.</li>
              <li>Join Pool (On-chain Lottery/Prize Pool) on Somnia.</li>
              <li>Try Somnia gas free (Relayer Integration).</li>
              <li>API access for developers.</li>
              <li>Integration with other Somnia ecosystem tools.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold text-white">Donate & Contribute</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Chainlens is an open-source project driven by the community. Your support helps us maintain and develop new features. If you find Chainlens useful, please consider donating or contributing to the project.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong>Donation Address:</strong> <code style={{ backgroundColor: '#333', padding: '2px 4px', borderRadius: '4px' }}>[Your Somnia Wallet Address Here]</code> (Replace with actual address)
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong>Contribute:</strong> We welcome contributions from developers, designers, and content creators. Find us on GitHub: <a href="[Your GitHub Repo URL]" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#333', padding: '2px 4px', borderRadius: '4px' }}>[Your GitHub Repo Name]</a> (Replace with actual GitHub URL)
            </p>
          </section>
        </div> {/* Closing max-w-4xl div */}
      </main> {/* Closing main tag */}
    </div> 
  );
}
