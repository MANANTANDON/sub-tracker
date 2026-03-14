import React from "react";

export const Header = ({ handleGmailLogin }) => {
  const MENU = ["Solution", "Services", "About Us", "Blog"];
  return (
    <>
      <div className="flex items-center justify-between  py-6 px-10 lg:py-12 lg:px-17">
        <a className="text-2xl font-bold tracking-tighter" href="">
          Subtrack
        </a>
        <div className="hidden lg:flex items-center gap-10 font-medium">
          {MENU.map((item, key) => (
            <h2 key={key} onClick={handleGmailLogin} className="cursor-pointer">
              {item}
            </h2>
          ))}
        </div>
        <button
          className="px-6 py-2 border border-zinc-900 rounded-[100px] cursor-pointer"
          onClick={handleGmailLogin}
        >
          Sign Up
        </button>
      </div>
    </>
  );
};
