import React from "react";
import { MessageSquare } from "lucide-react"; // Import an icon for visual interest

export default function TypingIndicator({ users = [] }) {
  if (!users.length) return null;

  // 1. Determine the display text (Handles 1, 2, or 3+ users)
  let displayText;
  if (users.length === 1) {
    displayText = `${users[0]} is typing`;
  } else if (users.length === 2) {
    displayText = `${users.join(" and ")} are typing`;
  } else {
    // For three or more, truncate the list and add "others"
    displayText = `${users.slice(0, 2).join(", ")} and ${
      users.length - 2
    } others are typing`;
  }

  return (
    <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors shadow-sm w-fit">
      
      {/* Visual Icon (Optional but nice) */}
      <MessageSquare size={16} className="text-blue-500 dark:text-blue-400" />
      
      {/* Text Label */}
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">
        {displayText}
      </span>
      
      {/* 💨 Animated Dots (Modern Chat UX) */}
      <div className="flex items-end space-x-1">
        <div className="dot h-1 w-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse-slow delay-0"></div>
        <div className="dot h-1 w-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse-slow delay-200"></div>
        <div className="dot h-1 w-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse-slow delay-400"></div>
      </div>

    </div>
  );
}