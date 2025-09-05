import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TxFeed from "../components/TxFeed";
import Analytics from "../components/Analytics";
import TxDetails from "../components/TxDetails";

type TxForDetails = {
	hash: string;
	status: string;
	from: string;
	to: string;
	value: string;
	blockNumber: number;
	timestamp: string;
	gasUsed: string;
	gasPrice: string;
};

export function Welcome() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TxForDetails | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="flex gap-6">
          <Sidebar />
          <div className="flex-1">
            <TxFeed
              onSelect={(tx) => {
                setSelected({
                  hash: tx.hash,
                  status: tx.status,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value,
                  blockNumber: 123456,
                  timestamp: new Date().toISOString(),
                  gasUsed: "50,000",
                  gasPrice: "30 gwei",
                });
                setOpen(true);
              }}
            />
            <Analytics />
          </div>
        </div>
      </main>
      <TxDetails open={open} onClose={() => setOpen(false)} tx={selected} />
    </div>
  );
}
