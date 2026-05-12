import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, User, BarChart3, Crown, HelpCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CookieConsentPopup from "@/components/CookieConsentPopup";
import { useI18n } from "@/lib/i18n";
import { safeGetItem, safeSetItem } from "@/lib/safe-storage";
import { safeGetSessionItem, safeRemoveSessionItem } from "@/lib/safe-storage";

// Luxury Color Palette
const DEEP_MIDNIGHT_BLUE = "#001830";
const PEARL_WHITE = "#FAF9F6";

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

  // Feature cards for clean navigation
  const features = [
    {
      id: 1,
      icon: Wand2,
      title: isHe ? "התחל ליצור" : "Start Creating",
      desc: isHe ? "צור תוכן מותאם אישית" : "Create personalized content",
      path: "/create",
    },
    {
      id: 2,
      icon: User,
      title: isHe ? "אזור אישי" : "Personal Area",
      desc: isHe ? "נהל את הפרופיל שלך" : "Manage your profile",
      path: "/profile",
    },
    {
      id: 3,
      icon: BarChart3,
      title: isHe ? "מעקב פעילות" : "Activity Tracking",
      desc: isHe ? "צפה בסטטיסטיקות השימוש" : "View usage statistics",
      path: "/analytics",
    },
    {
      id: 4,
      icon: Crown,
      title: isHe ? "ניהול מנוי" : "Subscription Management",
      desc: isHe ? "שדרג את התוכנית שלך" : "Upgrade your plan",
      path: "/subscription",
    },
    {
      id: 5,
      icon: HelpCircle,
      title: isHe ? "תמיכה" : "Support",
      desc: isHe ? "קבל עזרה ותמיכה" : "Get help and support",
      path: "/support",
    },
  ];

  return (
    <div
      className="min-h-screen pb-24 px-4 sm:px-6 md:px-8"
      dir={isHe ? "rtl" : "ltr"}
      style={{ backgroundColor: PEARL_WHITE }}
    >
      {/* Clean Header with Login Button */}
      <div className="pt-12 pb-12 max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3"
            style={{ color: DEEP_MIDNIGHT_BLUE, fontFamily: "'Assistant', sans-serif", fontWeight: 700 }}
          >
            {isHe ? "היי, מה תרצה לבנות היום?" : "Hey, what would you like to build today?"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="px-6 sm:px-8 py-3 rounded-2xl font-semibold text-white text-sm sm:text-base hover:shadow-lg transition-all duration-300 active:scale-95 shrink-0"
          style={{ backgroundColor: DEEP_MIDNIGHT_BLUE, fontFamily: "'Assistant', sans-serif" }}
        >
          {isHe ? "התחברות / הרשמה" : "Login / Sign Up"}
        </button>
      </div>

      {/* Navigation Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-5">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => navigate(feature.path)}
                className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 hover:shadow-lg active:scale-95 border border-gray-200 hover:border-transparent"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(0, 21, 41, 0.1)",
                }}
              >
                {/* Hover effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ backgroundColor: DEEP_MIDNIGHT_BLUE }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-3">
                    <IconComponent
                      size={24}
                      strokeWidth={1.5}
                      className="text-gray-600 group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                  <h3
                    className="text-lg sm:text-xl font-bold mb-1 text-gray-900 group-hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'Assistant', sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm text-gray-600 group-hover:text-white transition-colors duration-300"
                    style={{ opacity: 0.85 }}
                  >
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 origin-left group-hover:scale-x-100 transform scale-x-0 transition-transform duration-300 rounded-bl-2xl rounded-br-2xl"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                />
              </button>
            );
          })}
        </div>
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
