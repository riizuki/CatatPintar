"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FolderIcon,
  HomeIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  RectangleStackIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Folders", href: "/dashboard/folders", icon: FolderIcon },
    { name: "Quiz", href: "/dashboard/quiz", icon: QuestionMarkCircleIcon },
    {
      name: "Flashcards",
      href: "/dashboard/flashcards",
      icon: RectangleStackIcon,
    },
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
        {session?.user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={`https://i.pravatar.cc/150?u=${session.user.email}`}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full mr-3"
              />
              <div>
                <p className="text-sm font-medium text-black truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Logout"
              className="p-2 text-gray-500 rounded-md hover:bg-gray-200 hover:text-black"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return null;
}
