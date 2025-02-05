import { FormEvent, useEffect, useRef, useState } from "react";
import Input from "./Input";
import Message from "@/models/Message";
import { useAuth } from "@/context/AuthContext";
import User from "@/models/User";
import { useSocket } from "@/context/SocketContext";
import Image from "next/image";
import Welcome from "./Welcome";
import { formatDateHeader, formatTime } from "@/app/utils/formatMessageTime";
import MessageBubble from "./MessageBubble";

interface MessagesProps {
  conversationId: string | undefined;
  reciever?: User;
  onMenuClick: () => void;
  updateConversationLastMessage: (message: Message) => void;
  onNewConversation: () => Promise<void>;
}

interface GroupedMessages {
  date: string;
  messages: Message[];
}

export default function Messages({
  conversationId,
  reciever,
  onMenuClick,
  updateConversationLastMessage,
  onNewConversation,
}: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeUsers, socket } = useSocket();
  const [userLastActive, setUserLastActive] = useState<string | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    setMessages([]);
    setUserLastActive(reciever?.lastActive || null);
  }, [conversationId, reciever?.lastActive]);

  useEffect(() => {
    if (!reciever?.id) return;

    const handleMessage = (content: Message) => {
      if ([content.senderId, content.receiverId].includes(reciever.id)) {
        setMessages((prevMessages) => [...prevMessages, content]);
      }
    };

    const handleUserDisconnect = (data: {
      userId: string;
      lastActive: string;
    }) => {
      if (data.userId === reciever.id) {
        setUserLastActive(data.lastActive);
      }
    };

    socket?.on("message", handleMessage);
    socket?.on("userDisconnected", handleUserDisconnect);

    return () => {
      socket?.off("message", handleMessage);
      socket?.off("userDisconnected", handleUserDisconnect);
    };
  }, [socket, conversationId, reciever?.id]);

  const fetchMessages = async () => {
    if (!conversationId || !reciever?.id) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${authState.accessToken}`,
          },
        }
      );
      const data: Message[] = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, reciever?.id, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reciever?.id) return;

    const formData = new FormData(event.target as HTMLFormElement);
    const content = formData.get("content") as string;

    if (!content.trim()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.accessToken}`,
          },
          body: JSON.stringify({
            content,
            receiverId: reciever.id,
          }),
        }
      );

      if (response.ok) {
        (event.target as HTMLFormElement).reset();
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        updateConversationLastMessage(newMessage);
        if (!conversationId) {
          console.log("fetching");
          await onNewConversation();
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const groupMessagesByDate = (messages: Message[]): GroupedMessages[] => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups)
      .map(([date, messages]) => ({
        date,
        messages,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (!reciever?.id) {
    return <Welcome setIsSidebarOpen={onMenuClick} />;
  }

  const groupedMessages = groupMessagesByDate(messages);

  const getUserStatus = () => {
    if (activeUsers.includes(reciever?.id || "")) return "online";
    return `last seen at ${formatTime(userLastActive || reciever?.lastActive)}`;
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex items-center pb-4 space-x-6 border-b-2 border-gray-300">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
          ←
        </button>
        <Image
          className="w-10 h-10 rounded-md"
          src={
            reciever.profilePic ||
            "https://res.cloudinary.com/dt3japg4o/image/upload/v1733470742/samples/man-portrait.jpg"
          }
          height={40}
          width={40}
          alt="avatar"
        />
        <div>
          <h1 className="font-bold text-lg">{reciever?.name}</h1>
          <p className="text-sm text-gray-500">{getUserStatus()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 scrollbar-hide">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : groupedMessages.length > 0 ? (
          <div className="flex flex-col gap-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex justify-center mb-4">
                  <span className="bg-gray-100 px-4 py-1 rounded-full text-sm text-gray-600">
                    {formatDateHeader(group.date)}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {group.messages.map((message, index) => (
                    <MessageBubble
                      key={message.id || index}
                      message={message}
                      isSent={message.senderId === authState.user?.id}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Start chatting with {reciever.name}!
          </p>
        )}
      </div>

      <form className="flex space-x-4 mt-4" onSubmit={sendMessage}>
        <Input label="Type your message here" name="content" />
        <button className="px-4 text-2xl bg-green-700 hover:bg-green-800 rounded-lg text-white">
          ➤
        </button>
      </form>
    </div>
  );
}
