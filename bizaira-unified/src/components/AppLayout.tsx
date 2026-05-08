import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";
import CookieSettings from "./CookieSettings";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Wand2, HelpCircle, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { getActivityStats } from "@/lib/activity-tracker";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const { user, profile } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalActions, limit } = getActivityStats();
  const isLocked = totalActions >= limit;
  const isStudioPath = location.pathname.startsWith("/create");

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/create", icon: Wand2, label: t("nav.create") },
    { to: "/dashboard", icon: User, label: t("nav.dashboard") },
    { to: "/support", icon: HelpCircle, label: t("nav.support") },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
      >
        דלג לתוכן העיקרי / Skip to main content
      </a>

      {/* Mobile hamburger menu */}
      <div className="lg:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm"
          aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile side menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMenu}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">תפריט</h2>
                <button onClick={closeMenu} className="p-1">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isLocked ? "pointer-events-none opacity-50" : "hover:bg-gray-100"}`}
                    aria-disabled={isLocked}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Language toggle — floating top corner */}
      <main id="main-content" className="flex-1 pb-20">{children}</main>
      {isLocked && isStudioPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-6">
          <div className="pointer-events-none absolute inset-0 bg-white/10 backdrop-blur-xl" />
          <div className="relative w-full max-w-2xl rounded-[32px] border border-white/20 bg-white/80 p-8 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B1E3B] mb-3">
              {t("app.limit.title")}
            </p>
            <h2 className="text-3xl font-extrabold text-[#0B1E3B] mb-4">
              {t("app.limit.subtitle")}
            </h2>
            <p className="text-sm leading-7 text-[#334155] mb-6">
              {t("app.limit.desc")}
            </p>
            <div className="rounded-[24px] border border-[#0B1E3B]/10 bg-[#F8F7F4] p-6">
              <p className="text-sm text-[#475569] mb-4">
                {t("app.limit.upgrade")}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 text-[#0B1E3B] text-sm font-medium">
                  <Clock size={18} />
                  <span>{t("app.limit.renewal")}</span>
                </div>
                <button
                  onClick={() => window.location.assign("/pricing")}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#0B1E3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#172E52]"
                >
                  {t("app.limit.upgradeBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="bg-white border-t border-gray-100 py-2 px-4 text-center">
        <div className="flex justify-center items-center gap-4">
          <Link to="/accessibility" className="text-xs text-gray-500 hover:text-gray-700">
            הצהרת נגישות
          </Link>
          <CookieSettings />
        </div>
      </footer>
      {!(!user && location.pathname === "/") && <BottomNav />}
    </div>
  );
};

export default Layout;
