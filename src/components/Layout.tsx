// src/components/Layout.tsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.type === "admin";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Spotter&apos;s Journal
          </Link>

          <div className="flex gap-6 text-sm font-medium text-gray-600">
            {user ? (
              <>
                {isAdmin && (
                  <>
                    <Link
                      to="/add-aircraft-type"
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      + Aircraft Type
                    </Link>
                  </>
                )}

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
