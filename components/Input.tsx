import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  widthClass?: string;
  error?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
}

const Input = ({
  label,
  widthClass = "w-full",
  error,
  type = "text",
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className={`relative ${widthClass}`}>
      <input
        type={type}
        className={`
          peer
          w-full
          rounded-2xl
          border-2
          bg-white
          px-3
          pt-6
          pb-2
          text-gray-900
          placeholder-transparent
          transition-all
          focus:outline-none
          focus:ring-2
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-[#EBEBE6] focus:border-[#294B29] focus:ring-[#DBE7C9]"
          }
          ${className}
        `}
        placeholder={label}
        {...props}
      />
      <label
        className={`
          pointer-events-none
          absolute
          left-3
          top-2
          text-sm
          font-medium
          transition-all
          peer-placeholder-shown:top-5
          peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:text-sm
          ${error ? "text-red-500" : "text-gray-500"}
        `}>
        {label}
      </label>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
