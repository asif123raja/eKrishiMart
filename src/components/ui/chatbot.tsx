"use client"; // Use this directive if you're using Next.js with the App Router

import Link from "next/link";
import { FaComment } from "react-icons/fa"; // Import an icon from react-icons

const ChatbotIcon: React.FC = () => {
  return (
    <Link href="/ask">
      <div className="fixed bottom-4 right-4 bg-teal-600 text-white rounded-full p-3 shadow-lg hover:bg-teal-500 transition duration-300">
        <FaComment size={24} />
      </div>
    </Link>
  );
};

export default ChatbotIcon;
