import React from "react";

export const Button = ({ children, ...props }) => {
  return (
    <button
      className="bg-[#78211E] text-white px-3 py-2 rounded hover:bg-[rgb(90,24,21)] cursor-pointer select-none"
      {...props}
    >
      {children}
    </button>
  );
};
