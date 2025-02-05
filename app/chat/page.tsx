"use client";

import { ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import Input from "@/components/Input";
import Messages from "@/components/Messages";
import Iconversation from "../../models/Conversation";
import { useAuth } from "@/context/AuthContext";
import User from "@/models/User";
import { useSocket } from "@/context/SocketContext";
import { formatMessageTime } from "@/app/utils/formatMessageTime";
import Conversation from "@/components/Conversation";
import Welcome from "@/components/Welcome";
import Message from "@/models/Message";

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Iconversation[]>([]);
  const [searchResults, setsearchResults] = useState<User[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>("");
  const { authState, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { activeUsers, socket } = useSocket();

  const searchUsers = useCallback(
    async (query: string) => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/api/user/search?query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${authState.accessToken}` } }
        );
        const result = await response.json();
        setsearchResults(result.map((data: { item: User }) => data.item));
      } catch (error) {
        console.error("Failed to search users", error);
      }
    },
    [authState.accessToken]
  );

  const fetchConversations = useCallback(async () => {
    if (!authState.user) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations`,
        {
          headers: { Authorization: `Bearer ${authState.accessToken}` },
        }
      );
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  }, [authState.user, authState.accessToken]);

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    } else {
      setsearchResults([]);
    }
  }, [debouncedQuery, searchUsers]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      setConversations((prevConversations) => {
        const existingConversation = prevConversations.find(
          (conv) =>
            conv.participants.includes(message.senderId) &&
            conv.participants.includes(message.receiverId)
        );

        if (existingConversation) {
          return prevConversations.map((conv) => {
            if (conv.id === existingConversation.id) {
              return {
                ...conv,
                messages: [message, ...conv.messages],
              };
            }
            return conv;
          });
        } else {
          fetchConversations();
          return prevConversations;
        }
      });
    };

    socket?.on("message", handleMessage);

    return () => {
      socket?.off("message", handleMessage);
    };
  }, [socket, fetchConversations]);

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  };

  const renderConversations = () => {
    if (searchQuery) {
      if (searchResults.length === 0) {
        return <p className="text-lg font-semibold">No users found</p>;
      }
      return searchResults.map((user: User, index: number) => (
        <div
          key={index}
          onClick={() => {
            setSelectedConversationId(user.id);
            setIsSidebarOpen(false);
          }}>
          <Conversation
            name={user.name}
            avatar={user.profilePic}
            lastMessage=""
            lastMessageTime=""
          />
          {index < searchResults.length - 1 && <hr />}
        </div>
      ));
    } else if (conversations.length === 0) {
      return <p className="text-md">Search a name to begin chatting</p>;
    } else {
      return conversations.map((conv: Iconversation, index: number) => (
        <div
          key={conv.id}
          onClick={() => {
            setSelectedConversationId(conv.id);
            setIsSidebarOpen(false);
          }}>
          <Conversation
            name={conv.otherUser.name}
            avatar={conv.otherUser.profilePic}
            lastMessage={
              conv.messages.length > 0
                ? conv.messages[0].content
                : "No messages yet"
            }
            lastMessageTime={
              conv.messages.length > 0
                ? formatMessageTime(conv.messages[0].createdAt)
                : ""
            }
            active={activeUsers.includes(conv.otherUser.id)}
          />
          {index < conversations.length - 1 && <hr />}
        </div>
      ));
    }
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.participants.includes(message.senderId) &&
        conversation.participants.includes(message.receiverId)
          ? {
              ...conversation,
              messages: [message],
            }
          : conversation
      )
    );
  };

  return authState.user ? (
    <div className="p-4 md:p-12 bg-[#DBE7C9] h-screen">
      <div className="p-2 md:p-6 max-w-[1200px] mx-auto w-full h-full flex gap-8">
        <div className="hidden md:block basis-1/3">
          <div className="flex flex-col gap-2 h-full">
            <div className="relative">
              <Input
                type="text"
                label="Search"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  X
                </button>
              )}
            </div>

            <div className="flex flex-col h-full bg-white rounded-xl shadow-[0_8px_20px_#899878cc] overflow-hidden">
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4 min-h-0">
                <div className="flex flex-col gap-4">
                  {renderConversations()}
                </div>
              </div>

              <div className="p-4 border-t bg-white rounded-b-xl">
                <button
                  className="bg-green-700 p-2 w-full text-white rounded-lg"
                  onClick={() => {
                    logout();
                  }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 md:basis-2/3 bg-white rounded-xl relative shadow-[0_8px_20px_#899878cc]">
          {isSidebarOpen && (
            <>
              <div className="absolute md:hidden top-0 left-0 w-[80%] h-full z-50 bg-white rounded-xl shadow-[0_8px_20px_#899878cc]">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-4">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg">
                      X
                    </button>
                  </div>
                  <div className="px-4 relative">
                    <Input
                      type="text"
                      label="Search"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setDebouncedQuery("");
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        X
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-16">
                      {renderConversations()}
                    </div>
                    <div className="p-4 border-t bg-white">
                      <button
                        className="bg-green-700 p-2 w-full text-white rounded-lg"
                        onClick={() => {
                          logout();
                        }}>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="absolute md:hidden inset-0 bg-black bg-opacity-50 z-40 rounded-xl"
                onClick={() => setIsSidebarOpen(false)}
              />
            </>
          )}

          {selectedConversationId ? (
            <Messages
              conversationId={
                searchResults.length === 0
                  ? selectedConversationId
                  : conversations.find(
                      (conv) => conv.otherUser.id === selectedConversationId
                    )?.id
              }
              reciever={
                searchResults.length === 0
                  ? conversations.find(
                      (conv) => conv.id === selectedConversationId
                    )?.otherUser
                  : searchResults.find(
                      (user) => user.id === selectedConversationId
                    )
              }
              onMenuClick={() => setIsSidebarOpen(true)}
              updateConversationLastMessage={updateConversationLastMessage}
              onNewConversation={fetchConversations}
            />
          ) : (
            <Welcome setIsSidebarOpen={() => setIsSidebarOpen(true)} />
          )}
        </div>
      </div>
    </div>
  ) : null;
}
