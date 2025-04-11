import React, { useState, useRef, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut } from "./firebase";
import { useAuth } from "./AuthContext";

export default function GoogleAuthButton({ className = "", showUserIcon = true }) {
  const { user, credits, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
      setMenuOpen(false);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name) => {
    if (typeof name !== "string") return "??";
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <span className={`text-purple-200 hover:text-white transition ${className}`}>Loading...</span>;
  }

  if (!user) {
    return (
      <button
        onClick={login}
        className={`bg-purple-600 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow-md transition ${className}`}
      >
        Sign in with Google
      </button>
    );
  }

  if (!showUserIcon) {
    return (
      <button
        onClick={logout}
        className={`text-purple-200 hover:text-white transition ${className}`}
      >
        Sign out
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold shadow-md">
          {getInitials(user.displayName)}
        </div>
        <div className="flex items-center text-purple-200 px-3 py-1 rounded-full bg-black/30 border border-purple-500/30">
          <span className="mr-1">💰</span>
          <span>{credits !== null ? credits : '...'}</span>
        </div>
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black/90 rounded-md shadow-lg z-50 border border-purple-500/30 backdrop-blur-md overflow-hidden">
          <div className="px-4 py-3 border-b border-purple-500/30">
            <p className="text-sm text-white font-medium truncate">{user.displayName}</p>
            <p className="text-xs text-purple-300 truncate">{user.email}</p>
          </div>
          <div className="px-2 py-1 border-t border-purple-500/30">
            <button
              onClick={logout}
              className="w-full text-left text-sm text-purple-200 hover:text-white hover:bg-purple-900/50 px-2 py-2 rounded transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}