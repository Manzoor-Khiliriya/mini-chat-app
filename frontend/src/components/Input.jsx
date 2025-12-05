import React from "react";
import { cn } from "../utils/cn"; // optional helper (see below)

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  success,
  icon: Icon,
  className = "",
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-medium text-sm text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 transition focus-within:ring-2",
          error
            ? "border-red-500 ring-red-300"
            : success
            ? "border-green-600 ring-green-300"
            : "border-gray-300 dark:border-gray-600 focus-within:border-indigo-600 focus-within:ring-indigo-300",
          className
        )}
      >
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          {...rest}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && !error && <p className="text-xs text-green-600">{success}</p>}
    </div>
  );
};

export default Input;
