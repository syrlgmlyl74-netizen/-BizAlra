import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CookieConsentPopup from "@/components/CookieConsentPopup";
import { useI18n } from "@/lib/i18n";
import { safeGetItem } from "@/lib/safe-storage";
import { safeGetSessionItem, safeRemoveSessionItem } from "@/lib/safe-storage";

// Luxury Color Palette
const DEEP_MIDNIGHT_BLUE = "#001830";

const HomePage = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const isHe = lang === "he";
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  useEffect(() => {
    // Check if user just completed onboarding and hasn't seen cookie consent
    const onboardingJustCompleted = safeGetSessionItem("onboarding_just_completed");
    const cookieConsentShown = safeGetItem("bizaira_cookie_consent_shown");

    if (onboardingJustCompleted && !cookieConsentShown) {
      setShowCookiePopup(true);
      // Clear the flag so it doesn't show again
      safeRemoveSessionItem("onboarding_just_completed");
    }
  }, []);

  const quickActions = [
    {
      title: isHe ? "ניתוח פיננסי מהיר" : "Quick Financial Analysis",
      description: isHe ? "היכנס לניתוח עסקי וצפה בתובנות עיקריות" : "Open business analysis and review the key insights",
      path: "/create/analytics",
    },
    {
      title: isHe ? "יצירת קמפיין שיווקי" : "Create a Marketing Campaign",
      description: isHe ? "התחל ביצירת תוכן ושיווק בסטודיו התמונות" : "Start content and marketing creation in the studio",
      path: "/create/image-studio",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 pb-24 sm:px-6 md:px-8" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pt-10 md:pt-12">
        <header className="luxury-card">
          <h1 className="text-3xl font-extrabold text-[#001830] md:text-4xl">
            {isHe ? "ברוכים הבאים למרכז הניהול העסקי שלך" : "Welcome to your business management hub"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#4A5568] md:text-base">
            {isHe ? "בחר מסלול חכם, התחבר או צור חשבון כדי להתחיל לנהל את העסק שלך בקלות ובסטייל." : "Choose a smart path, log in or sign up to start managing your business easily and elegantly."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/auth?mode=login")}
              className="rounded-full border border-[#000B18] bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001830]"
            >
              {isHe ? "התחברות" : "Login"}
            </button>
            <button
              onClick={() => navigate("/auth?mode=register")}
              className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#001830] transition hover:bg-[#F8FAFF]"
            >
              {isHe ? "הרשמה" : "Register"}
            </button>
          </div>
        </header>

        <section className="luxury-card">
          <div className="flex items-center justify-between gap-3 py-4 border-b border-[#F1F5F9]">
            <div className="text-right">
              <h3 className="text-[18px] font-bold text-[#000F21]">{isHe ? "מצב החשבון שלך" : "Your Account Status"}</h3>
              <p className="mt-1 text-[13px] text-[#64748B]">{isHe ? "חבילה חינמית | נותרו עוד 5 פעולות לניצול החודש בסטודיו" : "Free plan | 5 actions left to use this month in Studio"}</p>
            </div>
          </div>
        </section>

        <section className="luxury-card">
          <h2 className="mb-4 text-xl font-bold text-[#000F21] md:text-2xl">{isHe ? "פעולות מהירות" : "Quick Actions"}</h2>
          <div className="space-y-0">
            {quickActions.map((action, index) => (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.path)}
                className="luxury-card flex w-full items-center justify-between gap-4 py-4 text-right transition hover:bg-[#F8FAFF]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#001830]/10 text-[#001830]">
                    {index === 0 ? <BarChart3 size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#001830]">{action.title}</h3>
                    <p className="mt-1 text-sm text-[#4A5568]">{action.description}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-[#001830]" />
              </button>
            ))}
          </div>
        </section>

        <section className="luxury-card">
          <div className="flex items-center justify-between gap-3 py-4 border-b border-[#F1F5F9]">
            <div className="text-right">
              <h3 className="text-[18px] font-bold text-[#000F21]">{isHe ? "סביבת עבודה אחרונה" : "Recent Workspace"}</h3>
              <p className="mt-1 text-[13px] text-[#64748B]">{isHe ? "אין יצירות אחרונות החודש. לחצי על אחת הפעולות המהירות כדי להתחיל." : "No recent creations this month. Tap one of the quick actions to get started."}</p>
            </div>
          </div>
        </section>

      </div>
      <CookieConsentPopup 
        isVisible={showCookiePopup} 
        onConsent={() => setShowCookiePopup(false)} 
      />
      <BottomNav />
    </div>
  );
};

export default HomePage;
