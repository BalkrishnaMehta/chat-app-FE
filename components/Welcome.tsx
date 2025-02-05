export default function Welcome({
  setIsSidebarOpen,
}: {
  setIsSidebarOpen: (isOpen: boolean) => void;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center text-center relative">
      <div className="absolute top-4 left-4 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg">
          ←
        </button>
      </div>
      <div>
        <p className="text-xl font-bold">Welcome! 👋</p>
        <p className="text-lg font-semibold">
          Select a chat to start messaging
        </p>
      </div>
    </div>
  );
}
