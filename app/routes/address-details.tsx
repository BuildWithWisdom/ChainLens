import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Navbar from '../components/Navbar';
import { api, type TxApi } from '../lib/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { CheckCircleIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function AddressDetailsPage() {
  const { hash } = useParams(); // 'hash' here is actually the address
  const address = hash as string;

  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<TxApi[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [txsError, setTxsError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const TXS_PER_PAGE = 20;

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const data = await api.getAddressSummary(address);
        setSummary(data);
        setSummaryError(null);
      } catch (e) {
        setSummaryError("Could not load address summary.");
      } finally {
        setLoadingSummary(false);
      }
    };

    const fetchTransactions = async (currentPage: number) => {
      setLoadingTxs(true);
      try {
        const offset = currentPage * TXS_PER_PAGE;
        const data = await api.getTransactionsForAddress(address, TXS_PER_PAGE, offset);
        setTransactions(prevTxs => {
          const newTxs = currentPage === 0 ? data : [...prevTxs, ...data];
          const uniqueTxs = Array.from(new Map(newTxs.map(tx => [tx.id, tx])).values());
          return uniqueTxs;
        });
        setHasMore(data.length === TXS_PER_PAGE);
        setTxsError(null);
      } catch (e) {
        setTxsError("Could not load transactions for this address.");
      } finally {
        setLoadingTxs(false);
      }
    };

    fetchSummary();
    fetchTransactions(0); // Initial fetch for transactions
  }, [address]);

  const loadMoreTxs = () => {
    if (hasMore && !loadingTxs) {
      setPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    if (page > 0) {
      const fetchTransactions = async () => {
        setLoadingTxs(true);
        try {
          const offset = page * TXS_PER_PAGE;
          const data = await api.getTransactionsForAddress(address, TXS_PER_PAGE, offset);
          setTransactions(prevTxs => [...prevTxs, ...data]);
          setHasMore(data.length === TXS_PER_PAGE);
          setTxsError(null);
        } catch (e) {
          setTxsError("Could not load more transactions.");
        } finally {
          setLoadingTxs(false);
        }
      };
      fetchTransactions();
    }
  }, [page, address]);

  const iconFor = (status: TxApi["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-emerald-400" />;
      case "pending":
        return <ArrowPathIcon className="h-5 w-5 text-yellow-400" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-rose-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 mb-6 break-all">Address: {address}</h1>

        {/* Summary Section */}
        <div className="bg-gray-900/50 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          {loadingSummary ? (
            <div className="grid grid-cols-2 gap-4">
              <SkeletonLoader className="h-6 w-3/4" />
              <SkeletonLoader className="h-6 w-3/4" />
              <SkeletonLoader className="h-6 w-1/2" />
              <SkeletonLoader className="h-6 w-1/2" />
            </div>
          ) : summaryError ? (
            <p className="text-red-400">{summaryError}</p>
          ) : summary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p><span className="text-gray-400">Total Sent Transactions:</span> <span className="font-medium text-white">{summary.total_sent_txs?.toLocaleString()}</span></p>
              <p><span className="text-gray-400">Total Received Transactions:</span> <span className="font-medium text-white">{summary.total_received_txs?.toLocaleString()}</span></p>
              <p><span className="text-gray-400">Total Volume (ETH):</span> <span className="font-medium text-white">{parseFloat(summary.total_volume_eth || 0).toFixed(4)} ETH</span></p>
            </div>
          ) : (
            <p className="text-gray-400">No summary data available for this address.</p>
          )}
        </div>

        {/* Transactions Section */}
        <div className="bg-gray-900/50 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Transactions</h2>
          {txsError ? (
            <p className="text-red-400">{txsError}</p>
          ) : transactions.length === 0 && !loadingTxs ? (
            <p className="text-gray-400">No transactions found for this address.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <a
                  key={tx.id}
                  href={`/transaction/${tx.fullHash}`}
                  className="block w-full text-left rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {iconFor(tx.status)}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Tx Hash</p>
                        <p className="text-gray-200 font-medium">{tx.hash}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">From / To</p>
                        <div className="flex items-center gap-1 text-gray-200 font-medium">
                          <span className="truncate max-w-[60px]">{tx.from}</span>
                          <span>→</span>
                          <span className="truncate max-w-[60px]">{tx.to ?? "(contract creation)"}</span>
                        </div>
                      </div>
                      <div className="justify-self-end">
                        <p className="text-gray-400 text-right">Value</p>
                        <p className="text-gray-200 font-semibold">{tx.value}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
              {loadingTxs && (
                <div className="space-y-4 mt-4">
                  {[...Array(TXS_PER_PAGE)].map((_, i) => (
                    <div key={i} className="w-full text-left rounded-2xl bg-gray-900 border border-gray-800 p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <SkeletonLoader className="h-6 w-6 rounded-full" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <SkeletonLoader className="h-5 w-3/4" />
                          <SkeletonLoader className="h-5 w-1/2" />
                          <SkeletonLoader className="h-5 w-1/4 justify-self-end" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {hasMore && !loadingTxs && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMoreTxs}
                    className="inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
