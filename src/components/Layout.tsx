// src/components/Layout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState, Fragment } from "react";
import {
  Menu,
  X,
  LogOut,
  Camera,
  UploadCloud,
  BarChart3,
  Plane,
  PlaneTakeoff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Added 'category' to group items for logical separation
  const navItems = [
    { label: "My Photos", href: "/photos", icon: Camera, category: "photography" },
    { label: "Upload Photo", href: "/upload", icon: UploadCloud, category: "photography" },
    { label: "Photo Stats", href: "/stats", icon: BarChart3, category: "photography" },
    { label: "My Flights", href: "/flights", icon: Plane, category: "aviation" },
    { label: "Add Flight", href: "/flights/add", icon: PlaneTakeoff, category: "aviation" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-primary/10 blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <img src="/cropped_logo.png" alt="Logo" className="h-9 w-auto relative transform transition-transform group-hover:scale-105" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Spotter&apos;s Journal
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-1 mr-4">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    const showSeparator = index > 0 && navItems[index - 1].category !== item.category;

                    return (
                      <Fragment key={item.href}>
                        {showSeparator && (
                          <div className="h-4 w-px bg-border mx-2" aria-hidden="true" />
                        )}
                        <Link to={item.href}>
                          <button
                            className={cn(
                              "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 gap-2",
                              isActive
                                ? "bg-secondary text-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        </Link>
                      </Fragment>
                    );
                  })}
                </div>

                <div className="h-6 w-px bg-border mr-4" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full pl-2 pr-4 hover:bg-muted">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">User Account</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500 focus:bg-red-50 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="font-semibold shadow-sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* MOBILE DROPDOWN PANEL */}
        {isOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            {user ? (
              <>
                <div className="space-y-1">
                  {navItems.map((item, index) => {
                    const showSeparator = index > 0 && navItems[index - 1].category !== item.category;
                    return (
                      <Fragment key={item.href}>
                        {showSeparator && <div className="my-2 border-t border-border/50" />}
                        <Link to={item.href} onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        </Link>
                      </Fragment>
                    );
                  })}
                </div>
                <div className="border-t pt-4 mt-2">
                  <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">Logged in</span>
                    </div>
                  </div>
                  <Button onClick={logout} variant="destructive" size="sm" className="w-full ">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
        <Outlet />
      </main>

      <footer className="border-t py-6 md:py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Spotter&apos;s Journal. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}