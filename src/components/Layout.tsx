// src/components/Layout.tsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="text-xl font-bold tracking-tight shrink-0">
            <div className="flex items-center gap-2">
              <img src="/cropped_logo.png" alt="Logo" className="h-10 w-auto" />
              <p className="text-lg md:text-xl">Spotter&apos;s Journal</p>
            </div>
          </Link>

          {/* DESKTOP MENU - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            {user && (
              <div className="flex gap-6">
                <Link to="/stats" className="hover:text-black transition">
                  Stats
                </Link>
                <Link to="/photos" className="hover:text-black transition">
                  Mine
                </Link>
                <Link to="/upload" className="hover:text-black transition">
                  Upload
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="shadow-none">
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={logout} variant="destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="hover:text-black transition">
                  Log In
                </Link>
                <Link to="/signup" className="hover:text-black transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON - Visible only on mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-black p-2 cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN PANEL */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-4 shadow-lg">
            {user ? (
              <>
                <div className="flex flex-col gap-4 font-medium border-b pb-4">
                  <Link to="/stats" onClick={() => setIsOpen(false)}>
                    Stats
                  </Link>
                  <Link to="/photos" onClick={() => setIsOpen(false)}>
                    Mine
                  </Link>
                  <Link to="/upload" onClick={() => setIsOpen(false)}>
                    Upload
                  </Link>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold">{user.username}</span>
                  <Button onClick={logout} variant="destructive" size="sm">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 font-medium">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Log In
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
