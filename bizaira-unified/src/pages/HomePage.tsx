import { useNavigate } from "react-router-dom";
import { Wand2, User, BarChart3, HelpCircle, Download, X, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { getGuestSession } from "@/lib/guest-session";
import { safeGetSessionItem } from "@/lib/safe-storage";
import { getActivityStats } from "@/lib/activity-tracker";

// Business-Luxury Color Palette (NO GOLD)
const NAVY = "#0D2344";
const CREAM = "#FBF4E8";
const OFF_WHITE = "#F5F0E8";
const LIGHT_TEXT = "#747474";
const PEARL_WHITE = "#F9FAFB";

const HomePage = () => {
  const { t, lang } = useI18n();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isHe = lang === "he";
  const isGuest = !user && safeGetSessionItem("onboarding_complete") === "true" && !!getGuestSession();
  const guestSession = isGuest ? getGuestSession() : null;

  const userName = profile?.full_name || user?.user_metadata?.full_name || (isGuest ? t("common.guest") : t("common.user"));
  const { creationsCount, downloadsCount, totalActions, remainingActions } = getActivityStats();

  // Feature cards matching specification exactly
  const features = [
    {
      id: 1,
      icon: Wand2,
      title: t("tool.studio.title"),
      desc: t("tool.studio.desc"),
      path: "/create",
    },
    {
      id: 2,
      icon: User,
      title: t("nav.dashboard"),
      desc: t("home.tools.profile"),
      path: "/dashboard",
    },
    {
      id: 3,
      icon: BarChart3,
      title: t("tool.analytics.title"),
      desc: t("tool.analytics.desc"),
      path: "/create/analytics",
    },
    {
      id: 4,
      icon: Clock,
      title: t("tool.time.title"),
      desc: t("tool.time.desc"),
      path: "/create/time",
    },
    {
      id: 5,
      icon: HelpCircle,
      title: t("nav.support"),
      desc: t("support.subtitle"),
      path: "/support",
    },
  ];

  return (
    <div
      className="min-h-screen pb-24 px-4 sm:px-6 md:px-8"
      dir={isHe ? "rtl" : "ltr"}
      style={{ backgroundColor: PEARL_WHITE }}
    >
      {/* Header Greeting - Premium Minimalist */}
      <div className="pt-8 pb-8 max-w-5xl mx-auto">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3"
          style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}
        >
          {t("home.hero.title1")}
        </h1>
        <p className="text-base sm:text-lg" style={{ color: LIGHT_TEXT }}>
          {t("home.hero.desc")}
        </p>
      </div>

      {/* Feature Cards Grid - 5 Card Layout */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-5">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => navigate(feature.path)}
                className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 hover:shadow-lg active:scale-95 border border-gray-200 hover:border-transparent"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(13, 35, 68, 0.1)",
                }}
              >
                {/* Hover effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ backgroundColor: NAVY }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-3">
                    <IconComponent
                      size={28}
                      strokeWidth={1.5}
                      className="text-gray-600 group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                  <h3
                    className="text-lg sm:text-xl font-bold mb-1 text-gray-900 group-hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
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

      {/* Usage Tracking Section */}
      <div className="max-w-5xl mx-auto mt-12 sm:mt-16">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: "'Assistant', sans-serif" }}>
              {t("dash.plan")}
            </h3>
            <p className="text-sm text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
              {t("home.plan.free")}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Progress Circle */}
            <div className="relative">
              <svg width="120" height="120" className="transform -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={NAVY}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(totalActions / limit) * 314} 314`}
                  className="transition-all duration-500"
                  style={{ filter: "drop-shadow(0 0 8px rgba(0, 31, 63, 0.3))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Assistant', sans-serif" }}>
                    {totalActions} / {limit}
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {t("home.usage.actions")}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Counts */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Wand2 size={16} className="text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {t("home.usage.created")}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Assistant', sans-serif" }}>
                  {creationsCount}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Download size={16} className="text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {t("home.usage.downloaded")}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Assistant', sans-serif" }}>
                  {downloadsCount}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <X size={16} className="text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {t("home.usage.deletions")}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Assistant', sans-serif" }}>
                  {deletionsCount}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BarChart3 size={16} className="text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {isHe ? "פעולות" : "Actions"}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Assistant', sans-serif" }}>
                  {totalActions}
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Date */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600" style={{ fontFamily: "'Heebo', sans-serif" }}>
            <Clock size={16} />
            <span>
              {isHe ? "מתחדש ב-" : "Renews on "}
              {renewalLabel}
            </span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default HomePage;
