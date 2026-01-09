"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderIcon,
  HomeIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Folders", href: "/dashboard/folders", icon: FolderIcon },
    { name: "Quiz", href: "/dashboard/quiz", icon: QuestionMarkCircleIcon },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: RectangleStackIcon },
    { name: "Settings", href: "/dashboard/settings", icon: CogIcon },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200">
      <div className="p-4">
        <h1 className="text-xl font-semibold text-black">CatatPintar</h1>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              pathname === item.href
                ? "bg-gray-200 text-black"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <item.icon className="w-6 h-6 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Image
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium text-black">Rizky Alfaridha</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
