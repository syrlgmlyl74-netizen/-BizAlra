import { ReactNode, useEffect, useMemo, useState } from "react";
import BottomNav from "./BottomNav";
import CookieSettings from "./CookieSettings";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Wand2, HelpCircle, User, Clock, AlertTriangle } from "lucide-react";
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
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { totalActions, limit, nextRenewalDate } = getActivityStats();
  const isLocked = totalActions >= limit;
  const isStudioPath = location.pathname.startsWith("/create");
  useEffect(() => {
    const handleOpenLimitModal = () => {
      if (isLocked && isStudioPath) {
        setShowLimitModal(true);
      }
    };

    window.addEventListener("open-studio-limit-modal", handleOpenLimitModal);
    return () => window.removeEventListener("open-studio-limit-modal", handleOpenLimitModal);
  }, [isLocked, isStudioPath]);

  useEffect(() => {
    setShowLimitModal(false);
  }, [location.pathname]);
  const renewalDateText = useMemo(() => nextRenewalDate
    ? nextRenewalDate.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
    : lang === "he"
      ? "תאריך לא זמין"
      : "Date unavailable", [lang, nextRenewalDate]);
  const renewalCountdown = useMemo(() => {
    if (!nextRenewalDate) return null;
    const diffMs = nextRenewalDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [nextRenewalDate]);
  const upgradeButtonLabel = lang === "he" ? "שדרג ל-PRO" : "Upgrade to PRO";

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/create", icon: Wand2, label: t("nav.create") },
    { to: "/dashboard", icon: User, label: t("nav.dashboard") },
    { to: "/support", icon: HelpCircle, label: t("nav.support") },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <div dir={isHe ? "rtl" : "ltr"} className={`min-h-screen flex flex-col bg-soft-cream ${isHe ? "text-right" : "text-left"}`}>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
      >
        {t("app.skipToContent")}
      </a>

      {/* Mobile hamburger menu */}
      <div className="lg:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-soft-cream/90 backdrop-blur-sm border border-[rgba(74,85,104,0.12)] rounded-lg p-2 shadow-soft-business"
          aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile side menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMenu}>
          <div className="fixed right-0 top-0 h-full w-64 bg-soft-cream shadow-soft-business" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">{t("nav.menu")}</h2>
                <button onClick={closeMenu} className="p-1" aria-label={t("nav.close")}>
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
      {showLimitModal && isLocked && isStudioPath && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#001830]/30 p-4 backdrop-blur-md"
          onClick={() => setShowLimitModal(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-[32px] border border-[#001830]/10 bg-[#FFFDF8] p-7 shadow-[0_40px_90px_rgba(0,24,48,0.24)]"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="absolute right-4 top-4 rounded-full bg-[#001830]/5 p-2 text-[#001830] transition hover:bg-[#001830]/10"
              aria-label={isHe ? "סגור חלון" : "Close modal"}
            >
              <X size={18} />
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-[#001830]/10 p-3 text-[#001830]">
                <AlertTriangle size={24} />
              </div>
              <div className="text-right flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#001830] mb-2">
                  {t("app.limit.title")}
                </p>
                <h2 className="text-3xl font-extrabold text-[#001830] leading-tight mb-3">
                  {t("app.limit.subtitle")}
                </h2>
                <p className="text-sm leading-7 text-slate-600 mb-4">
                  {t("app.limit.desc")}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[26px] border border-[#001830]/10 bg-[#F8F7F2] p-5 text-right">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="rounded-full bg-[#001830]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#001830]">
                  {isHe ? "אזהרה" : "Warning"}
                </div>
                <div className="flex items-center gap-2 text-[#001830] text-sm font-semibold">
                  <Clock size={17} />
                  <span>{isHe ? "חידוש קרדיטים" : "Credit renewal"}</span>
                </div>
              </div>

              <p className="text-base font-bold text-[#001830]">
                {renewalCountdown !== null ? (isHe ? `בעוד ${renewalCountdown} ימים` : `${renewalCountdown} days left`) : (isHe ? "לא זמין כרגע" : "Not available right now")}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {isHe ? `תאריך חידוש: ${renewalDateText}` : `Renewal date: ${renewalDateText}`}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  {t("app.limit.upgrade")}
                </p>
                <button
                  onClick={() => window.location.assign("/pricing")}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#001830] px-6 py-3 text-sm font-semibold text-[#F5F5DC] transition hover:bg-[#03172c]"
                >
                  {upgradeButtonLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="bg-soft-cream border-t border-[rgba(74,85,104,0.12)] py-2 px-4 text-center">
        <div className="flex justify-center items-center gap-4">
          <Link to="/accessibility" className="text-xs text-gray-500 hover:text-gray-700">
            {t("footer.accessibility")}
          </Link>
          <CookieSettings />
        </div>
      </footer>
      {!(!user && location.pathname === "/") && <BottomNav />}
    </div>
  );
};

export default Layout;
