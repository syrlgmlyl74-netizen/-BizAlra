import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";
import CookieSettings from "./CookieSettings";
import { LanguageToggle } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { Menu, X, Home, Wand2, HelpCircle, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const usageUsed = profile?.credits_used ?? Number(window.localStorage.getItem("bizaira_creations_count") || "0");
  const usageLimit = 5;
  const isLocked = usageUsed >= usageLimit;

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
      <div className="fixed top-3 left-3 z-50">
        <LanguageToggle />
      </div>
      <main id="main-content" className="flex-1 pb-20">{children}</main>
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6">
          <div className="w-full max-w-xl rounded-[32px] border border-white/15 bg-white/95 p-8 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-luxury-primary mb-3">
              {isHe ? "מגבלת שימוש" : "Usage Limit Reached"}
            </p>
            <h2 className="text-2xl font-extrabold text-luxury-black mb-4">
              {isHe ? "הגעת למגבלת 5 השימושים שלך" : "You've reached your 5-use limit"}
            </h2>
            <p className="text-sm leading-relaxed text-luxury-gray-600">
              {isHe
                ? "כל התכונות נחסמות עד שיתחדש החודש או עד לשדרוג תכנית."
                : "All features are locked until the next renewal period or a plan upgrade."}
            </p>
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
      <BottomNav />
    </div>
  );
};

export default Layout;
