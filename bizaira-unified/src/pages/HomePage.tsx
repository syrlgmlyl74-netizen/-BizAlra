import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, User, BarChart3, Crown, HelpCircle } from "lucide-react";
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

  // Feature rows for premium executive navigation
  const features = [
    {
      id: 2,
      icon: User,
      title: isHe ? "אזור אישי" : "Profile area",
      desc: isHe ? "עדכן שם, אימייל והעדפות באופן מהיר" : "Update name, email and preferences quickly",
      path: "/profile",
    },
    {
      id: 3,
      icon: BarChart3,
      title: isHe ? "ניתוח עסקי" : "Business analytics",
      desc: isHe ? "קבל תמונת מצב ודוח ביצועים ממוקד" : "Get a clear status and performance report",
      path: "/create/analytics",
    },
    {
      id: 6,
      icon: BarChart3,
      title: isHe ? "סטודיו תמונות" : "Image studio",
      desc: isHe ? "צור תמונות מוצר ותכנים חזותיים בקלות" : "Create product images and visual content with ease",
      path: "/create/image-studio",
    },
    {
      id: 5,
      icon: HelpCircle,
      title: isHe ? "תמיכה מהירה" : "Fast support",
      desc: isHe ? "מצא תשובות ותגל את הכלים הנכונים" : "Find answers and discover the right tools",
      path: "/support",
    },
    {
      id: 4,
      icon: Crown,
      title: isHe ? "שדרוג לחבילה" : "Upgrade plan",
      desc: isHe ? "פתח גישה לכל הכלים והיצירות ללא הגבלה" : "Unlock all tools and unlimited creations",
      path: "/pricing",
    },
  ];

  return (
    <div
      className="min-h-screen pb-24 px-4 sm:px-6 md:px-8 bg-soft-cream"
      dir={isHe ? "rtl" : "ltr"}
    >
      {/* Clean Header with Login Button */}
      <div className="pt-12 pb-12 max-w-5xl mx-auto flex flex-col gap-4 items-center text-center">
        <div className="w-full">
          <h1 className="font-bold text-3xl md:text-4xl text-[#001830] tracking-tight">
            {isHe ? "ברוכים הבאים למרכז הניהול העסקי שלך" : "Welcome to your business management hub"}
          </h1>
          <div className="mx-auto max-w-2xl text-sm font-light text-soft-muted mt-3">
            {isHe ? "בחר מסלול חכם, התחבר או צור חשבון כדי להתחיל לנהל את העסק שלך בקלות ובסטייל." : "Choose a smart path, log in or sign up to start managing your business easily and elegantly."}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => navigate("/auth?mode=login")}
            className="rounded-2xl border border-[#000B18] bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001830]"
          >
            {isHe ? "התחברות" : "Login"}
          </button>
          <button
            onClick={() => navigate("/auth?mode=register")}
            className="rounded-2xl border border-[#000B18] bg-white px-6 py-3 text-sm font-semibold text-[#000B18] transition hover:bg-[#F8FAFF]"
          >
            {isHe ? "הרשמה" : "Register"}
          </button>
        </div>
      </div>

      {/* Executive feature rows */}
      <div className="max-w-6xl mx-auto space-y-4">
        {features.map((feature) => {
          const IconComponent = feature.icon;

          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => navigate(feature.path)}
              className="luxury-card group w-full text-right transition duration-300 hover:-translate-y-0.5 hover:shadow-soft-business"
            >
              <div className="luxury-card-row items-start">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#001830]/10 text-[#001830]">
                    <IconComponent size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="luxury-card-title text-lg md:text-xl">{feature.title}</h3>
                    <p className="luxury-card-text text-sm">{feature.desc}</p>
                  </div>
                </div>

                <div className="rounded-full bg-[#001830]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#001830]/70">
                  {isHe ? "פתח" : "Open"}
                </div>
              </div>
            </button>
          );
        })}
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
