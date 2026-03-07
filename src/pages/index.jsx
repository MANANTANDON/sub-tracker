import { useRouter } from "next/router";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGmailLogin = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`;
    const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

    const authURL =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `state=${email}`;

    window.location.href = authURL;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SubTracker
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Never miss a subscription billing again
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 border border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Enter your email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 transition text-zinc-100"
              />
            </div>

            <button
              onClick={handleGmailLogin}
              disabled={loading}
              className="w-full bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              Continue with Gmail
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>✨ No credit card required • No manual entry needed</p>
        </div>
      </div>
    </div>
  );
}
