// src/components/Layout.tsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            <div className="flex items-center gap-2">
              <img
                src="/cropped_logo.png"
                alt="Spotter's Journal Logo"
                className="h-12 w-auto"
              />
              <p className="text-xl">Spotter&apos;s Journal</p>
            </div>
          </Link>

          <div className="flex gap-6 text-sm font-medium text-gray-700">
            {user ? (
              <>
                <Link to="/photos" className="hover:text-black transition">
                  My Photos
                </Link>
                <Link to="/upload" className="hover:text-black transition">
                  Upload
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-black transition">
                  Log In
                </Link>
                <Link to="/signup" className="hover:text-black transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
