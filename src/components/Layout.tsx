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
  Plus,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "My Photos", href: "/photos", icon: Camera, category: "photography" },
    { label: "Upload Photo", href: "/upload", icon: UploadCloud, category: "photography" },
    { label: "Photo Stats", href: "/stats", icon: BarChart3, category: "photography" },
    { label: "My Flights", href: "/flights", icon: Plane, category: "aviation" },
    { label: "Add Flight", href: "/flights/add", icon: PlaneTakeoff, category: "aviation" },
    { label: "Flight Stats", href: "/flight-stats", icon: BarChart3, category: "aviation" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pb-20 lg:pb-0">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-primary/10 blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <img src="/cropped_logo.png" alt="Logo" className="h-8 w-auto lg:h-9 relative transform transition-transform group-hover:scale-105" />
            </div>
            <span className="text-base lg:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              <span className="hidden sm:inline">Spotter&apos;s Journal</span>
              <span className="sm:hidden">Spotter</span>
            </span>
          </Link>

          {/* DESKTOP MENU (LG+) */}
          <div className="hidden lg:flex items-center gap-2">
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

          {/* MOBILE ACTIONS (HEADER) */}
          <div className="lg:hidden flex items-center gap-2">
            {!user ? (
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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

        {/* MOBILE MENU OVERLAY */}
        {isOpen && (
          <div className="lg:hidden border-t bg-background px-4 py-6 space-y-6 shadow-xl animate-in fade-in slide-in-from-top-4 fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Photography</h3>
                <div className="grid grid-cols-1 gap-1">
                  {navItems.filter(i => i.category === 'photography').map(item => (
                    <Link key={item.href} to={item.href} onClick={() => setIsOpen(false)}>
                      <Button variant={location.pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-11">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Aviation</h3>
                <div className="grid grid-cols-1 gap-1">
                  {navItems.filter(i => i.category === 'aviation').map(item => (
                    <Link key={item.href} to={item.href} onClick={() => setIsOpen(false)}>
                      <Button variant={location.pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-11">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {user && (
              <div className="pt-4 border-t">
                <Button onClick={logout} variant="destructive" className="w-full h-11">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* BOTTOM NAVIGATION (MOBILE) */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">

            <Link to="/photos" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", location.pathname === "/photos" ? "text-primary" : "text-muted-foreground")}>
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-medium">Photos</span>
            </Link>

            <Link to="/flights" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", location.pathname === "/flights" ? "text-primary" : "text-muted-foreground")}>
              <Plane className="h-5 w-5" />
              <span className="text-[10px] font-medium">Flights</span>
            </Link>

            {/* QUICK ACTIONS "+" BUTTON */}
            <div className="relative -top-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="h-12 w-12 rounded-full shadow-lg shadow-primary/20 ring-4 ring-background">
                    <Plus className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="w-48 mb-2">
                  <DropdownMenuItem asChild>
                    <Link to="/upload" className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/flights/add" className="flex items-center gap-2">
                      <PlaneTakeoff className="h-4 w-4" />
                      <span>Add Flight</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", (location.pathname === "/stats" || location.pathname === "/flight-stats") ? "text-primary" : "text-muted-foreground")}>
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Stats</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top" className="w-40 mb-2">
                <DropdownMenuItem asChild>
                  <Link to="/stats">Photo Stats</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/flight-stats">Flight Stats</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", location.pathname === "/" ? "text-primary" : "text-muted-foreground")}>
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
        <Outlet />
      </main>

      <footer className="border-t py-6 lg:py-8 mt-auto hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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