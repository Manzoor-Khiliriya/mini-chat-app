import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-center text-sm p-3">
      &copy; {new Date().getFullYear()} Mini Chat
    </footer>
  );
}
