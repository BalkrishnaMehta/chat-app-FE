import { formatTime } from "@/app/utils/formatMessageTime";
import Message from "@/models/Message";

export default function MessageBubble({
  message,
  isSent,
}: {
  message: Message;
  isSent: boolean;
}) {
  const isShortMessage = message.content.length < 30;

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[65%] min-w-[60px] ${isSent ? "pr-3" : "pl-3"}`}>
        <div
          className={`p-3 rounded-xl relative ${
            isSent
              ? "bg-green-600 text-white rounded-tr-none"
              : "bg-gray-200 text-gray-800 rounded-tl-none"
          }`}>
          <div
            className={`${
              isSent
                ? "-right-2 border-b-green-600"
                : "-left-2 border-b-gray-200"
            } top-0 absolute w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent rotate-180`}
          />
          <div
            className={`${
              isShortMessage ? "flex items-center gap-4" : "pb-6"
            }`}>
            <span className="break-words">{message.content}</span>
            <span
              className={`text-xs self-end ${
                isSent ? "text-slate-200" : "text-gray-500"
              } ${
                isShortMessage
                  ? "whitespace-nowrap"
                  : "absolute bottom-2 right-3"
              }`}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
