import { Header } from "@/components/Layout/Header";
import { HeroSection } from "@/components/Layout/HeroSection";
import React, { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGmailLogin = () => {
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`;
    const SCOPES =
      "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email";

    const authURL =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPES)}`;

    window.location.href = authURL;
  };
  return (
    <>
      <div
        className="bg-zinc-900 h-screen w-screen"
        style={{
          backgroundImage: "url(/media/images/bg.png)",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Header handleGmailLogin={handleGmailLogin} />
        <HeroSection handleGmailLogin={handleGmailLogin} />
      </div>
    </>
  );
}

// <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-slate-900 to-slate-800">
//   <div className="w-full max-w-md">
//     <div className="text-center mb-12">
//       <h1 className="text-5xl font-bold mb-4">
//         <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//           SubTracker
//         </span>
//       </h1>
//       <p className="text-gray-400 text-lg">
//         Never miss a subscription billing again
//       </p>
//     </div>

//     <div className="bg-slate-800 rounded-lg p-8 border border-gray-700">
//       <button
//         onClick={handleGmailLogin}
//         disabled={loading}
//         className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition flex items-center justify-center gap-3"
//       >
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
//           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//         </svg>
//         Sign in with Google
//       </button>
//     </div>

//     <div className="text-center mt-8 text-gray-500 text-sm">
//       <p>✨ No credit card required • No manual entry needed</p>
//     </div>
//   </div>
// </div>
