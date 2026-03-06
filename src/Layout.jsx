import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { authService, realtimeService } from "@/api/firebaseClient";
import {
  Home, Plus, FolderOpen, Bookmark, LogOut, Menu, X, ChevronRight, Shield, User, MessageSquare
} from "lucide-react";

const navItems = [
  { name: "Browse", page: "Home", icon: Home },
  { name: "Official Posts", page: "OfficialPosts", icon: Shield },
  { name: "Create Entry", page: "CreateEntry", icon: Plus },
  { name: "My Entries", page: "MyEntries", icon: FolderOpen },
  { name: "Bookmarks", page: "Bookmarks", icon: Bookmark },
];

const userMenuItems = [
  { name: "Profile", page: "Profile", icon: User },
  { name: "Messages", page: "Messages", icon: MessageSquare },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const _navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = realtimeService.onMessagesForUser(user.uid, (msgs) => {
      const count = msgs.filter((m) => !m.read).length;
      setUnreadCount(count);
    });
    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    await authService.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <style>{`
        :root {
          --background: 222 47% 11%;
          --foreground: 210 40% 98%;
        }
        body { background: #0f172a; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800/50 z-50
        flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">FTC</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">FTC Hub</h1>
            <p className="text-slate-500 text-xs mt-0.5">Team Resource Database</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2">
          {navItems.map(({ name, page, icon: Icon }) => {
            const isActive = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-sm font-medium
                  ${isActive
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5" />
                {name}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              to={createPageUrl("AdminPanel")}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-sm font-medium
                ${currentPageName === "AdminPanel"
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <Shield className="w-4.5 h-4.5" />
              Admin Panel
              {currentPageName === "AdminPanel" && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )}

          {/* User Menu Items */}
          <div className="mt-4 pt-4 border-t border-slate-700/30">
            {userMenuItems.map(({ name, page, icon: Icon }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-sm font-medium
                    ${isActive
                      ? "bg-orange-500/10 text-orange-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {name}
                  {name === "Messages" && unreadCount > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                      {unreadCount}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        {user && (
          <div className="p-4 mx-3 mb-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.username || user.full_name || "User"}</p>
                <p className="text-slate-500 text-xs truncate">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 p-2 z-10">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">FTC</span>
          </div>
          <span className="text-white font-semibold text-sm">FTC Hub</span>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}