import { useEffect, useState } from "react";
import { Plus, Download, Trash2, Calendar, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { getActivityStats } from "@/lib/activity-tracker";

const MIDNIGHT_BLUE = "#001830";
const WHITE = "#FFFFFF";
const SOFT_GRAY = "#757575";
const LIGHT_BORDER = "#E5E7EB";

const ProfilePage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(getActivityStats());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Real-time polling for activity updates
  useEffect(() => {
    const pollStats = () => {
      setStats(getActivityStats());
      setRefreshTrigger(prev => prev + 1);
    };

    const interval = setInterval(pollStats, 300);
    window.addEventListener("storage", pollStats);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", pollStats);
    };
  }, []);

  const { creationsCount, downloadsCount, deletionsCount, totalActions, limit, nextRenewalDate, weeklyTotal, dailyTotal, firstUseDate } = stats;
  
  // Dynamic Credits Calculation from Profile or LocalStorage
  const creditsTotal = profile?.credits_total ?? limit;
  const creditsUsed = profile?.credits_used ?? totalActions;
  const remainingCredits = Math.max(0, creditsTotal - creditsUsed);
  const progressPercent = creditsTotal > 0 ? Math.round((remainingCredits / creditsTotal) * 100) : 0;

  // Dynamic Plan Label (with proper fallback)
  const planLabel = profile?.plan && profile.plan !== "free" 
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + " Plan"
    : (isHe ? "תוכנית חינם" : "Free Plan");

  // Real First Use Date
  const firstUseLabel = profile?.plan_started_at 
    ? new Date(profile.plan_started_at).toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short", year: "numeric" })
    : firstUseDate
    ? new Date(firstUseDate).toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short", year: "numeric" })
    : (isHe ? "היום" : "Today");

  // Real Renewal Date
  const renewalLabel = profile?.last_renewal_at
    ? new Date(profile.last_renewal_at).toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short" })
    : nextRenewalDate
    ? nextRenewalDate.toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short" })
    : (isHe ? "בעוד חודש" : "Next Month");

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: WHITE, color: MIDNIGHT_BLUE, fontFamily: "'Heebo', 'Assistant', sans-serif" }} dir={isHe ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="px-6 py-8" style={{ borderBottom: `1px solid ${LIGHT_BORDER}` }}>
        {/* Top Row: Upgrade Button | Plan & Credits */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: MIDNIGHT_BLUE }}
          >
            {isHe ? "שדרג ל-PRO" : "Upgrade to PRO"}
          </button>

          <div className={isHe ? "text-left" : "text-right"}>
            <div className="text-xs tracking-wide" style={{ color: SOFT_GRAY, letterSpacing: "0.05em", fontSize: "11px" }}>
              {isHe ? "תוכנית" : "PLAN"}
            </div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: MIDNIGHT_BLUE }}>
              {planLabel}
            </div>
          </div>
        </div>

        {/* Credits Counter & Progress Bar */}
        <div>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-3xl font-bold" style={{ color: MIDNIGHT_BLUE }}>
              {remainingCredits}
            </span>
            <span className="text-base" style={{ color: SOFT_GRAY }}>
              / {creditsTotal}
            </span>
          </div>

          {/* Ultra-thin elegant progress bar - 1.5px */}
          <div className="overflow-hidden rounded-full" style={{ backgroundColor: LIGHT_BORDER, height: "1.5px" }}>
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: MIDNIGHT_BLUE,
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Rows Section */}
      <div className="px-6 py-8" style={{ borderBottom: `1px solid ${LIGHT_BORDER}` }}>
        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* First Use */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={14} style={{ color: SOFT_GRAY }} />
              <span className="text-xs" style={{ color: SOFT_GRAY, letterSpacing: "0.02em" }}>
                {isHe ? "שימוש ראשון" : "FIRST USE"}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: MIDNIGHT_BLUE }}>
              {firstUseLabel}
            </p>
          </div>

          {/* Renewal */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <RefreshCw size={14} style={{ color: SOFT_GRAY }} />
              <span className="text-xs" style={{ color: SOFT_GRAY, letterSpacing: "0.02em" }}>
                {isHe ? "חידוש הבא" : "NEXT RENEWAL"}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: MIDNIGHT_BLUE }}>
              {renewalLabel}
            </p>
          </div>

          {/* Weekly Total */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={14} style={{ color: SOFT_GRAY }} />
              <span className="text-xs" style={{ color: SOFT_GRAY, letterSpacing: "0.02em" }}>
                {isHe ? "סכום שבועי" : "WEEKLY TOTAL"}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: MIDNIGHT_BLUE }}>
              {weeklyTotal}
            </p>
          </div>

          {/* Daily Total */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={14} style={{ color: SOFT_GRAY }} />
              <span className="text-xs" style={{ color: SOFT_GRAY, letterSpacing: "0.02em" }}>
                {isHe ? "סכום יומי" : "DAILY TOTAL"}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: MIDNIGHT_BLUE }}>
              {dailyTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Grid Section */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-center gap-3 px-2">
          {/* Creations Card */}
          <div
            className="flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
            style={{
              width: "clamp(70px, 22vw, 95px)",
              aspectRatio: "1",
              backgroundColor: WHITE,
              border: `1px solid ${LIGHT_BORDER}`,
              borderRadius: "10px",
              padding: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <Plus size={20} style={{ color: MIDNIGHT_BLUE }} className="mb-2" />
            <p className="text-lg font-bold" style={{ color: MIDNIGHT_BLUE }}>
              {creationsCount}
            </p>
            <p className="text-[10px] mt-1" style={{ color: SOFT_GRAY }}>
              {isHe ? "יצירות" : "Creates"}
            </p>
          </div>

          {/* Downloads Card */}
          <div
            className="flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
            style={{
              width: "clamp(70px, 22vw, 95px)",
              aspectRatio: "1",
              backgroundColor: WHITE,
              border: `1px solid ${LIGHT_BORDER}`,
              borderRadius: "10px",
              padding: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <Download size={20} style={{ color: MIDNIGHT_BLUE }} className="mb-2" />
            <p className="text-lg font-bold" style={{ color: MIDNIGHT_BLUE }}>
              {downloadsCount}
            </p>
            <p className="text-[10px] mt-1" style={{ color: SOFT_GRAY }}>
              {isHe ? "הורדות" : "Downloads"}
            </p>
          </div>

          {/* Deletions Card */}
          <div
            className="flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
            style={{
              width: "clamp(70px, 22vw, 95px)",
              aspectRatio: "1",
              backgroundColor: WHITE,
              border: `1px solid ${LIGHT_BORDER}`,
              borderRadius: "10px",
              padding: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <Trash2 size={20} style={{ color: MIDNIGHT_BLUE }} className="mb-2" />
            <p className="text-lg font-bold" style={{ color: MIDNIGHT_BLUE }}>
              {deletionsCount}
            </p>
            <p className="text-[10px] mt-1" style={{ color: SOFT_GRAY }}>
              {isHe ? "מחיקות" : "Deletions"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
