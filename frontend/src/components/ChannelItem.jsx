import React from "react";
import {
  Lock,
  LogOut,
  UserPlus,
  Clock,
  Users,
  Hash,
  Loader2,
} from "lucide-react";

export default function ChannelItem({
  c,
  onSelect,
  onJoin,
  joining,
  onViewRequests,
  currentId,
  onLeave,
}) {
  // Only allow selection if the user is a member
  const handleSelect = () => c.isMember && onSelect(c);

  // Determine if the channel is currently active
  const isActive = currentId === c.id;

  return (
    <div
      className={`p-3 rounded-lg transition cursor-pointer mb-2
        border border-transparent 
        ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/50 border-blue-500 border-l-4"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800"
        }
        `}
      onClick={handleSelect}
    >
      <div className="flex justify-between items-center gap-2">
        {/* Name + Icons */}
        <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
          <span
            className={`${
              isActive
                ? "text-blue-600 dark:text-blue-300 font-semibold"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {c.name}
          </span>
          {c.isPrivate && (
            <Lock
              size={14}
              className="text-gray-500 dark:text-gray-400"
              aria-label="Private Channel"
            />
          )}
        </div>

        {/* Right Side Action */}
        <div className="flex items-center gap-3">
          {/* Owner: manage requests */}
          {c.isOwner && c.isPrivate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewRequests(c.id);
              }}
              className="flex cursor-pointer items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium bg-green-50/50 p-1.5 rounded transition"
              aria-label="View Join Requests"
            >
              <Users size={14} />
            </button>
          )}

          {/* Member → Leave */}
          {c.isMember && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLeave();
              }}
              className="flex cursor-pointer items-center gap-1 text-red-500 hover:text-red-600 text-xs font-medium p-1.5 rounded transition"
              aria-label="Leave Channel"
            >
              <LogOut size={14} />
            </button>
          )}

          {/* Not joined → Join */}
          {!c.isMember && !c.requested && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin(c);
              }}
              disabled={joining}
              className="flex cursor-pointer items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={joining ? "Joining in progress" : "Join Channel"}
            >
              {joining ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <UserPlus size={15} />
              )}
              <span className="hidden sm:inline-block">
                {c.isPrivate ? "Request" : "Join"}
              </span>
            </button>
          )}

          {/* Join Requested → Pending */}
          {!c.isMember && c.requested && (
            <span className="flex cursor-pointer items-center gap-1 text-xs text-orange-500 dark:text-orange-400 font-medium">
              <Clock size={13} /> Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
