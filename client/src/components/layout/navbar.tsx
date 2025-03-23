import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, FileText, ChevronDown, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <FileText className="text-primary h-6 w-6 mr-2" />
                <span className="font-bold text-xl text-gray-800">ResumeBuilder</span>
              </a>
            </Link>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </Button>
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user ? getInitials(user.username) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2 text-sm text-gray-900 border-b">
                    <div className="font-medium">{user?.username}</div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <a className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
