import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api, type TxApi } from "../lib/api";
import Navbar from "../components/Navbar";
import { ArrowLeftIcon, CheckCircleIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/solid";

export function meta() {
  return [
    { title: "Transaction Details" },
    { name: "description", content: "Detailed view of a blockchain transaction" },
  ];
}

function formatGasPrice(gasPrice?: string): string {
  if (!gasPrice) return "N/A";
  const gasPriceWei = BigInt(gasPrice);
  const gwei = Number(gasPriceWei) / 1e9;
  return `${gwei.toFixed(2)} Gwei`;
}

export default function TransactionDetailsPage() {
  const navigate = useNavigate();
  const { hash } = useParams<{ hash: string }>();
  const [transaction, setTransaction] = useState<TxApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) {
      setError("Transaction hash not provided in URL.");
      setLoading(false);
      return;
    }

    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);
      try {
        const tx = await api.getTxByFullHash(hash);
				console.log("Transaction from DB:", tx);
        if (tx) {
          setTransaction(tx);
        } else {
          setError(`Transaction with hash ${hash} not found.`);
        }
      } catch (e) {
        setError(`Failed to load transaction: ${(e as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [hash]);

  const getStatusIcon = (status: TxApi["status"]) => {
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
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">Transaction Details</h1>

        {loading && (
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 text-gray-400 text-center">
            Loading transaction details...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-900 bg-rose-950 text-rose-300 p-6 text-center">
            {error}
          </div>
        )}

        {transaction && !loading && !error && (
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 text-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Tx Hash</p>
                <p className="break-all">{transaction.fullHash}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="capitalize inline-flex items-center gap-2">
                  {getStatusIcon(transaction.status)}
                  {transaction.status}
                </p>
              </div>
              <div>
                <p className="text-gray-400">From</p>
                <p className="break-all font-mono text-xs">{transaction.from}</p>
              </div>
              <div>
                <p className="text-gray-400">To</p>
                <p className="break-all font-mono text-xs">{transaction.to ?? "(Contract Creation)"}</p>
              </div>
              <div>
                <p className="text-gray-400">Value</p>
                <p>{transaction.value}</p>
              </div>
              <div>
                <p className="text-gray-400">Block Number</p>
                <p>{transaction.blockNumber}</p>
              </div>
              <div>
                <p className="text-gray-400">Timestamp</p>
                <p>{transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Gas Used</p>
                <p>{transaction.gasUsed ? Number(transaction.gasUsed).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Gas Price</p>
                <p>{formatGasPrice(transaction.gasPrice)}</p>
              </div>
              <div>
                <p className="text-gray-400">Input Data</p>
                <p className="break-all font-mono">{transaction.inputData ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Nonce</p>
                <p>{transaction.nonce ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Type</p>
                <p>{transaction.type ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Chain ID</p>
                <p>{transaction.chainId ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
