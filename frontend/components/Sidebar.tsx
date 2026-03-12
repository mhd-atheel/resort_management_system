"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  UserCog,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "receptionist"],
  },
  {
    title: "Rooms",
    href: "/rooms",
    icon: BedDouble,
    roles: ["admin", "receptionist"],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    roles: ["admin", "receptionist"],
  },
  {
    title: "Staffs",
    href: "/staffs",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: CalendarDays,
    roles: ["admin", "receptionist"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userMe, setUserMe] = useState({
    email: "",
    name: "",
    userType: "",
  });

  const [isLoaded, setIsLoaded] = useState(false);

  /* ----------------------------------
     Load user from localStorage
  ----------------------------------- */
  useEffect(() => {
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const userType = localStorage.getItem("user-type");

    setUserMe({
      email: email ?? "",
      name: name ?? "",
      userType: userType ?? "",
    });

    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  const getInitials = (name: string) =>
    name ? name.slice(0, 2).toUpperCase() : "??";

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  return (
    <aside className="h-screen w-[280px] bg-[#F3F3F3] flex flex-col p-4 border-r border-gray-200">

      {/* Page Title */}
      <div className="mb-8 px-4 mt-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {navItems.find((item) => pathname === item.href)?.title ||
            "Dashboard"}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems
          .filter((item) => item.roles.includes(userMe.userType))
          .map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-[#193948] text-white shadow-lg translate-x-1"
                    : "text-slate-500 hover:bg-white hover:text-[#193948] hover:shadow-sm"
                )}
              >
                <Icon
                  size={22}
                  className={cn(
                    "transition-colors duration-300",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-[#193948]"
                  )}
                />
                <span className="font-semibold text-[15px]">
                  {item.title}
                </span>

                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                )}
              </Link>
            );
          })}
      </nav>

      {/* User Dropdown */}
      <div className="mt-auto pt-6 border-t border-gray-200/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${userMe.name}`}
                />
                <AvatarFallback className="bg-slate-100 text-slate-600">
                  {getInitials(userMe.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">
                  {userMe.name}
                </span>
                <span className="text-xs text-slate-500">
                  {userMe.email}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{userMe.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {userMe.userType}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
