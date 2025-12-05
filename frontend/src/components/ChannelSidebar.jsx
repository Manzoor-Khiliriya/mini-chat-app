// src/components/ChannelSidebar.jsx
import React from "react";
import ChannelItem from "./ChannelItem";

export default function ChannelSidebar({
  channels,
  currentChannel,
  onSelect,
  onJoin,
  joiningId,
  onViewRequests,
  onLeave,
  createSection
}) {
  return (
    <aside className="w-72 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto bg-white dark:bg-gray-850 shadow-lg">
      <h3 className="text-xl font-bold mb-4 ml-3 bg-gray-50 text-center">
        All Channels
      </h3>

      {/* List */}
      <div className="space-y-1">
        {channels.map((c) => (
          <ChannelItem
            key={c.id}
            c={c}
            currentId={currentChannel?.id}
            onSelect={onSelect}
            onJoin={onJoin}
            joining={joiningId === c.id}
            onViewRequests={onViewRequests}
            onLeave={() => onLeave(c)}
          />
        ))}
      </div>

    </aside>
  );
}
