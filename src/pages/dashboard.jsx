import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const { token: queryToken } = router.query;

    if (queryToken) {
      localStorage.setItem("token", queryToken);
      setToken(queryToken);
      fetchSubscriptions(queryToken);
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        fetchSubscriptions(storedToken);
      } else {
        router.push("/");
      }
    }
  }, [router.query, router]);

  async function fetchSubscriptions(authToken) {
    try {
      setSyncing(true);
      const res = await fetch("/api/subscriptions/sync", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch");
      }

      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to sync subscriptions");
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }

  const handleSync = async () => {
    await fetchSubscriptions(token);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">SubTracker</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const amount = parseFloat(sub.amount.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-gray-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">SubTracker</h1>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Summary Card */}
        <div className="bg-slate-800 rounded-lg p-8 border border-gray-700 mb-8">
          <h2 className="text-3xl font-bold text-cyan-400 mb-2">
            ${totalMonthly.toFixed(2)}
          </h2>
          <p className="text-gray-400 mb-4">Total Monthly Spend</p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync Subscriptions"}
          </button>
        </div>

        {/* Subscriptions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.length === 0 ? (
            <div className="col-span-3 bg-slate-800 rounded-lg p-8 border border-gray-700 text-center">
              <p className="text-gray-400 mb-4">No subscriptions found</p>
              <button
                onClick={handleSync}
                className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Try Syncing
              </button>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div
                key={sub._id}
                className="bg-slate-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-500 transition"
              >
                <h3 className="text-lg font-bold text-white mb-3">
                  {sub.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="text-cyan-400 font-bold">
                      {sub.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Billing:</span>
                    <span>{sub.nextBillingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>{sub.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-400">{sub.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
