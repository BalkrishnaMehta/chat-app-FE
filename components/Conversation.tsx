import Image from "next/image";

interface ConversationProps {
  avatar?: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  active?: boolean;
}

export default function Conversation({
  avatar,
  name,
  lastMessage,
  lastMessageTime,
  active,
}: ConversationProps) {
  const defaultAvatar =
    "https://res.cloudinary.com/dt3japg4o/image/upload/v1733470742/samples/man-portrait.jpg";

  return (
    <div className="flex space-x-3 cursor-pointer items-center pb-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-md overflow-hidden">
          <Image
            className="object-cover"
            src={avatar || defaultAvatar}
            height={40}
            width={40}
            alt={`${name}'s avatar`}
            priority
          />
        </div>
        {active !== undefined && (
          <span
            className={`bottom-0 left-7 absolute w-3.5 h-3.5 ${
              active ? "bg-emerald-500" : "bg-gray-300"
            } border-2 border-white rounded-full`}
          />
        )}
      </div>
      <div className="flex justify-between w-full">
        <div className="flex flex-col">
          <h1 className="font-bold text-lg">{name}</h1>
          <p className="text-sm text-gray-600 truncate w-[210px]">
            {lastMessage}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{lastMessageTime}</p>
        </div>
      </div>
    </div>
  );
}
