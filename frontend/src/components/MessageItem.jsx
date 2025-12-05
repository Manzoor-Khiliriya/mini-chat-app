import React from "react";
import dayjs from "dayjs";
import { CheckCheck } from "lucide-react";

export default function MessageItem({ msg, isOwn }) {
  const senderName = msg.sender?.displayName || msg.sender?.username;

  const ownTextColor = "text-white";
  const otherTextColor = "text-gray-900 dark:text-gray-100";

  const timeStampColor = isOwn
    ? "text-blue-200"
    : "text-gray-500 dark:text-gray-400";

  const contentColor = isOwn ? ownTextColor : otherTextColor;

  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col">
        {/* Message Bubble */}
        <div
          className={`
             px-4 py-3 shadow-md transition-colors 
            text-sm 
            
            ${
              isOwn
                ? "bg-blue-600 text-white rounded-t-xl rounded-bl-xl"
                : "bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-t-xl rounded-br-xl"
            }
            ${isOwn ? "rounded-br-none" : "rounded-bl-none"}
          `}
        >
          {/* Text Content */}
          {msg.content && <div className={contentColor}>{msg.content}</div>}

          {/* Attachment (Image) */}
          {msg.attachmentUrl && (
            <img
              src={msg.attachmentUrl}
              alt="attachment"
              className="rounded-lg mt-2 max-h-64 object-cover w-full cursor-pointer"
              loading="lazy"
            />
          )}

          {/* Timestamp and Status */}
          <div
            className={`mt-1 pt-1 flex items-center justify-end gap-2 text-[11px] font-light ${timeStampColor}`}
          >
            {dayjs(msg.createdAt).format("HH:mm")}

            {/* Seen Status (Only for own messages) */}
            {isOwn && (
              <CheckCheck
                size={14}
                className={
                  msg.isRead ? "text-green-300" : "text-blue-200 opacity-90"
                }
              />
            )}
          </div>
        </div>
        {/* Sender (only show for others, above the bubble) */}
        {!isOwn && (
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 my-1">
            {senderName}
          </div>
        )}
      </div>
    </div>
  );
}
