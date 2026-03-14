import React from "react";

export const HeroSection = ({ handleGmailLogin }) => {
  return (
    <>
      <div className="mt-10 flex items-center flex-col justify-center gap-7">
        <h1 className="text-center text-3xl lg:text-6xl font-bold tracking-tighter">
          Gain complete visibility <br />
          into your Cashflow
        </h1>
        <p className="text-center text-sm lg:text-lg max-w-xl mx-5 whitespace-normal">
          Manage all your recurring payments in one centralized platform. Track
          subscriptions, automate recurring billing, and stay on top of every
          upcoming payment with ease.
        </p>
        <div className="flex items-center gap-7 w-fit mt-10">
          <button
            className="px-6 py-3 bg-zinc-900 text-zinc-100 rounded-[100px] cursor-pointer"
            onClick={handleGmailLogin}
          >
            Explore Product
          </button>
          <button
            className="px-6 py-3 border border-zinc-900 rounded-[100px] cursor-pointer"
            onClick={handleGmailLogin}
          >
            Book a demo
          </button>
        </div>
      </div>
    </>
  );
};
