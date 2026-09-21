# Chainlens: Real-time Solana Explorer

![Chainlens Logo](public/logo_128.png)

## 🚀 Project Overview

Chainlens is a powerful, real-time blockchain explorer designed specifically for **Solana**. It addresses the critical need for transparent and user-friendly access to on-chain activity, providing unparalleled visibility into transactions, network throughput, and key trends.

Our primary motivation for building Chainlens is to empower Solana builders and users with a practical tool that enhances trust, usability, and ultimately, the adoption of the network. By making on-chain activity visible and accessible, Chainlens lowers the barrier for both technical and non-technical users to engage with Solana.

## ✨ Features

Chainlens goes beyond traditional block explorers by focusing on clarity and actionable insights:

- **Real-time Transaction Feed:** See the latest transactions on Solana as they happen.
- **Detailed Transaction View:** Dive deep into individual transactions, including full signature, status, fee payer/recipient addresses, value, slot, timestamp, fee usage, compute units, and programs.
- **Intelligent Search & Filtering:** Easily find specific transactions by hash or address, and filter by type (e.g., token transfers, contract calls) or status (e.g., failed).
- **Network Analytics Dashboard:** Gain immediate insights into Solana's health and activity with real-time metrics:
  - **TPS (Transactions Per Second):** Estimated network throughput.
  - **Blocks per Minute:** Rate of new block creation.
  - **Active Addresses:** Number of unique participants in recent transactions.
  - **Recent Transactions:** Total transactions in the last minute.
- **Transaction Volume Chart:** Visualize Solana's transaction activity over the last 24 hours, identifying trends and peak periods.
- **User-Friendly Interface:** A clean, intuitive UI with a dark theme, designed for optimal readability and ease of use.

## 💡 Why Chainlens is Unique

Unlike generic explorers or direct RPC interactions, Chainlens offers:

- **Analytics-First Approach:** We don't just display data; we analyze it into meaningful metrics and trends, providing a deeper understanding of network dynamics.
- **Lightweight & Community-Driven:** Built with extensibility in mind, Chainlens can be easily forked, adapted, and expanded by the Solana community for diverse needs.
- **Forward-Looking Design:** Our architecture is designed to seamlessly integrate future features like fee-free onboarding and community savings pools, positioning Chainlens as a foundational tool for the network's growth.

## 🛠️ Technical Stack

Chainlens is built with a robust and modern technology stack:

- **Frontend:**
  - **React:** A declarative, component-based JavaScript library for building user interfaces.
  - **TypeScript:** A superset of JavaScript that adds static typing, enhancing code quality and maintainability.
  - **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
  - **React Router:** For efficient and declarative client-side routing.
- **Backend/Data Layer:**
  - **Supabase (PostgreSQL):** Used as a powerful, scalable backend for indexing and querying Solana blockchain data. This includes storing transaction records and enabling advanced analytics via custom RPC functions.
- **Blockchain Integration:**
  - **Solana JSON-RPC:** Integrates with a Solana mainnet RPC endpoint (`https://api.mainnet-beta.solana.com`) to sample recent slots and transactions.
- **Build Tool:**
  - **Vite:** A next-generation frontend tooling that provides an extremely fast development experience.

## ⚙️ How It Works

Chainlens operates through a robust, real-time data pipeline:

1.  **Data Ingestion:** A background service samples the latest confirmed Solana slot (~every 15s), skipping vote-only transactions and storing up to `TXS_PER_BLOCK` transactions per sample. A daily job deletes rows older than `TX_RETENTION_DAYS` to bound table growth.
2.  **Indexing & Storage:** Raw transaction data is then processed — parsing SystemProgram transfers for value/recipient, recording fee payer, fees, and compute units — and stored in a structured PostgreSQL database via Supabase. This indexing allows for efficient querying and analysis.
3.  **Real-time Updates:** The frontend components (Transaction Feed, Analytics, Charts) consume data directly from the Supabase backend, ensuring that users always see the most up-to-date information.
4.  **User Interaction:** Users can interact with the UI to search, filter, and drill down into specific transaction details, all powered by optimized queries against the indexed data.

## 🚀 Future Enhancements

Chainlens is designed with a clear roadmap for continuous development and deeper integration into the Solana ecosystem:

- **Fee-free Onboarding:** Integrate relayers to facilitate fee-free transactions, improving user onboarding and experience.
- **Community Savings Pools:** Implement features for tracking and visualizing on-chain treasury and micro-finance activities within Solana.
- **Advanced Analytics Dashboards:** Develop more sophisticated dashboards for token flows, contract activity, and dApp leaderboards.
- **Public API Layer:** Expose the indexed Solana data via a public API, allowing other builders to leverage Chainlens' data for their own applications.
- **Token Standard Support:** Extend indexing to highlight SPL token transfers and specific program events.

## 🛠️ Getting Started (For Developers)

To run Chainlens locally:

1.  **Clone the repository:**
    ```bash
    git clone Chainlens
    cd chainlens
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Supabase:**
    - **Create a new Supabase project** at [Supabase.com](https://supabase.com/).
    - Once your project is created, navigate to **Project Settings -> API** to find your **Project URL** and **`anon` public key**. You will need these for your `.env` file.
    - **Database Schema Setup:**
      - Go to the **Table Editor** in your Supabase project.
      - Create a new table named `transactions` by running `supabase/schema.sql` in the SQL Editor (single copy-paste: table, indexes, RLS policy, and all RPC functions).
      - Create another table named `processing_state` with the following columns: `id` (INT, Primary Key) and `last_processed_block` (BIGINT).
      - **Row Level Security (RLS):** Go to the **Authentication -> Policies** section.
        - For the `transactions` table, enable RLS and create a policy to allow `SELECT` for all users.
        - For the `processing_state` table, enable RLS and create policies to allow `SELECT` for all users and `UPDATE` for the service role (or appropriate roles for your setup).
        - _Note: For development, you might temporarily disable RLS or use a service key, but for production, proper RLS is crucial._

4.  **Configure Environment Variables:**
    - Create a `.env` file in the project root.
    - Add your **Supabase Project URL** and **`anon` public key** (from step 3):
      ```
      VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
      VITE_SUPABASE_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
      ```
    - Add the Solana RPC URL:
      ```
      VITE_API_URL="https://api.mainnet-beta.solana.com"
      ```
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Chainlens should now be running at `http://localhost:5173` (or similar).

## 🤝 Contributing

We welcome contributions from the Solana community! If you'd like to contribute, please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
