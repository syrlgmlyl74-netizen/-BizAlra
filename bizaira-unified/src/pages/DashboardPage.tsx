import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wand2,
  CreditCard,
  HeadphonesIcon,
  TrendingUp,
  Sparkles,
  Download,
  Copy,
  Check,
  User,
  MessageSquare,
  BarChart3,
  DollarSign,
  Clock,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import {
  loadCreations,
  trackDownload,
  type Creation,
  type CreationType,
} from "@/lib/creations-store";
import { getActivityStats } from "@/lib/activity-tracker";

const TYPE_ICON: Record<CreationType, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  message: MessageSquare,
  analytics: BarChart3,
  pricing: DollarSign,
  time: Clock,
  image: Camera,
  photo: Camera,
};

const DashboardPage = () => {
  const { t, lang } = useI18n();
  const { user, profile } = useAuth();  const navigate = useNavigate();  const isHe = lang === "he";
  const userName = user?.user_metadata?.full_name || (isHe ? "אורח" : "Guest");

  const [creations, setCreations] = useState<Creation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState(() => getActivityStats());

  const refreshData = useCallback(() => {
    setCreations(loadCreations());
    setStats(getActivityStats());
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    refreshData();
    window.addEventListener("storage", refreshData);
    return () => window.removeEventListener("storage", refreshData);
  }, [refreshData, user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short" });

  const handleCopyCreation = (creation: Creation) => {
    navigator.clipboard.writeText(creation.content);
    setCopiedId(creation.id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCreation = (creation: Creation) => {
    const blob = new Blob([creation.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizaira-${creation.type}-${creation.id.slice(0, 6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackDownload();
    refreshData();
  };

  const typeLabel = (type: CreationType) => {
    const labels: Record<CreationType, { he: string; en: string }> = {
      message: { he: "הודעה", en: "Message" },
      analytics: { he: "ניתוח עסקי", en: "Analytics" },
      pricing: { he: "תמחור", en: "Pricing" },
      time: { he: "ניהול זמן", en: "Time" },
      image: { he: "תמונה", en: "Image" },
      photo: { he: "סטודיו", en: "Photo" },
    };
    return isHe ? labels[type].he : labels[type].en;
  };

  const dashboardCards = [
    {
      title: isHe ? "התחל ליצור" : "Start Creating",
      description: isHe ? "צור תוכן עסקי מתקדם עם AI" : "Create advanced business content with AI",
      icon: Wand2,
      href: "/create",
      primary: true,
      color: "#000810",
    },
    {
      title: isHe ? "אזור אישי" : "Personal Area",
      description: isHe ? "נהל את הפרופיל וההעדפות שלך" : "Manage your profile and preferences",
      icon: User,
      href: "/profile",
      primary: false,
      color: "#000810",
    },
    {
      title: isHe ? "מעקב פעילות" : "Activity Tracker",
      description: isHe ? "צפה בסטטיסטיקות השימוש שלך" : "View your usage statistics",
      icon: TrendingUp,
      href: "/dashboard",
      primary: false,
      color: "#000810",
    },
    {
      title: isHe ? "ניהול מנוי" : "Subscription",
      description: isHe ? "נהל את התוכנית והתשלומים שלך" : "Manage your plan and payments",
      icon: CreditCard,
      href: "/pricing",
      primary: false,
      color: "#000810",
    },
    {
      title: isHe ? "תמיכה" : "Support",
      description: isHe ? "קבל עזרה ותמיכה מקצועית" : "Get help and professional support",
      icon: HeadphonesIcon,
      href: "/support",
      primary: false,
      color: "#000810",
    },
  ];

  const hasName = !!user?.user_metadata?.full_name;
  const greetingTitle = hasName ? `Hi ${userName},` : "Hello, Guest.";
  const greetingSubtitle = hasName
    ? isHe
      ? "ברוך הבא לאזור האישי הפרטי שלך."
      : "Welcome to your Personal Area."
    : "Welcome to your personal workspace.";

  const MIDNIGHT_NAVY = "#001830";
const PEARL_WHITE = "#FAF9F6";

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: PEARL_WHITE, fontFamily: "Heebo, Assistant, sans-serif" }}>
      {/* Header with Auth Button */}
      <div className="flex justify-end p-6">
        <button className="px-4 py-2 rounded-lg border-2 border-transparent bg-transparent text-gray-700 hover:bg-gray-900 hover:text-white transition-all duration-300" style={{ borderColor: MIDNIGHT_NAVY }}>
          {isHe ? "התחברות / הרשמה" : "Login / Sign Up"}
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="rounded-[32px] border p-10 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.08)]" style={{ backgroundColor: PEARL_WHITE, borderColor: LIGHT_GREY, color: MIDNIGHT_NAVY }}>
          <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr] items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">{isHe ? "האזור האישי" : "Personal Area"}</p>
              <h1 className="text-4xl sm:text-5xl leading-tight mb-4 font-bold" style={{ color: MIDNIGHT_NAVY }}>
                {isHe ? "היי, מה תרצה לבנות היום?" : "Hi, what would you like to create today?"}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-gray-600">
                {greetingSubtitle}
              </p>
            </div>
            <div className="rounded-[28px] border p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.08)]" style={{ backgroundColor: PEARL_WHITE, borderColor: LIGHT_GREY, color: MIDNIGHT_NAVY }}>
              <p className="text-[11px] uppercase tracking-[0.3em] mb-4 text-gray-500">{isHe ? "סטטוס" : "Status"}</p>
              <p className="text-3xl font-semibold text-gray-900">
                {profile?.plan || (isHe ? "תוכנית חינמית" : "Free Plan")}
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {isHe ? "חלל עדין וממותג לעבודה עסקית אישית." : "A delicate, branded space for your personal business work."}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[28px] p-6 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.08)] border" style={{ backgroundColor: PEARL_WHITE, borderColor: LIGHT_GREY, color: MIDNIGHT_NAVY }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: MIDNIGHT_NAVY }}>
                <TrendingUp size={24} style={{ color: PEARL_WHITE }} strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-semibold">{profile?.credits_used || 0}</span>
            </div>
            <p className="text-sm font-light">{isHe ? "קרדיטים בשימוש" : "Credits Used"}</p>
            <div className="mt-4 w-full rounded-full h-1 bg-gray-200">
              <div className="h-1 rounded-full bg-gray-900" style={{ width: profile?.credits_total ? `${(profile.credits_used / profile.credits_total) * 100}%` : '0%', backgroundColor: MIDNIGHT_NAVY }}></div>
            </div>
            <p className="text-xs mt-2 text-gray-500">{profile?.credits_used || 0}/{profile?.credits_total || 0}</p>
          </div>

          <div className="rounded-[28px] p-6 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.08)] border" style={{ backgroundColor: PEARL_WHITE, borderColor: LIGHT_GREY, color: MIDNIGHT_NAVY }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: MIDNIGHT_NAVY }}>
                <Sparkles size={24} style={{ color: PEARL_WHITE }} strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-semibold">{stats.creationsCount}</span>
            </div>
            <p className="text-sm font-light">{isHe ? "יצירות AI" : "AI Generations"}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
              <div className="h-1 rounded-full" style={{ width: "0%", backgroundColor: MIDNIGHT_NAVY }}></div>
            </div>
            <p className="text-xs mt-2 text-gray-500">{stats.creationsCount}/∞</p>
          </div>

          <div className="rounded-[28px] p-6 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.08)] border" style={{ backgroundColor: PEARL_WHITE, borderColor: LIGHT_GREY, color: MIDNIGHT_NAVY }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: MIDNIGHT_NAVY }}>
                <MessageSquare size={24} style={{ color: PEARL_WHITE }} strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-semibold">{stats.downloadsCount}</span>
            </div>
            <p className="text-sm font-light">{isHe ? "הודעות נשלחו" : "Messages Sent"}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
              <div className="h-1 rounded-full" style={{ width: "0%", backgroundColor: MIDNIGHT_NAVY }}></div>
            </div>
            <p className="text-xs mt-2 text-gray-500">{stats.downloadsCount}/∞</p>
          </div>

          <div className="rounded-[28px] p-6 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.08)] border" style={{ backgroundColor: PEARL_WHITE, borderColor: LIGHT_GREY, color: MIDNIGHT_NAVY }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: MIDNIGHT_NAVY }}>
                <BarChart3 size={24} style={{ color: PEARL_WHITE }} strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-semibold">{stats.deletionsCount}</span>
            </div>
            <p className="text-sm font-light">{isHe ? "מחיקות" : "Deletions"}</p>
            <div className="mt-4 w-full rounded-full h-1 bg-gray-200">
              <div className="h-1 rounded-full" style={{ width: "0%", backgroundColor: MIDNIGHT_NAVY }}></div>
            </div>
            <p className="text-xs mt-2 text-gray-500">{stats.deletionsCount}/∞</p>
          </div>
        </div>

        {/* Upgrade to PRO Button */}
        <div className="mt-10 text-center">
          <button className="px-8 py-4 rounded-[20px] text-white font-light text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1" style={{ backgroundColor: MIDNIGHT_NAVY, boxShadow: "0 12px 32px -8px rgba(0, 1, 48, 0.24)" }}>
            {isHe ? "שדרג ל-PRO" : "Upgrade to PRO"}
          </button>
        </div>
        {/* Cards Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.title}
                to={card.href}
                className="
                  group relative overflow-hidden rounded-[20px] transition-all duration-300 hover:scale-105 hover:-translate-y-5 border border-gray-200
                  bg-white
                "
                style={{
                  boxShadow: '0 8px 32px -8px rgba(0,0,0,0.1)',
                }}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ backgroundColor: MIDNIGHT_NAVY }}>
                    <IconComponent size={20} strokeWidth={1.5} style={{ color: PEARL_WHITE }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-6 text-gray-600">
                    {card.description}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{
                       background: `linear-gradient(135deg, rgba(0, 8, 16, 0.05) 0%, transparent 50%)`,
                       filter: 'blur(10px)',
                     }} />
              </Link>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <div className="mb-16">
          <div
            className="rounded-3xl p-10 border"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(247, 242, 233, 0.95) 100%)",
              borderColor: "rgba(1, 18, 36, 0.08)",
              boxShadow: "0 24px 48px -12px rgba(1, 18, 36, 0.12)",
            }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
              <div>
                <h2 className="text-4xl font-semibold mb-4" style={{ fontWeight: 300, color: NAVY }}>
                  {isHe ? "פעילות אחרונה" : "Recent Activity"}
                </h2>
                <p className="text-lg max-w-2xl" style={{ fontWeight: 300, color: "#5B5B5B", opacity: 0.9 }}>
                  {isHe ? "צפה ביצירות האחרונות שלך ובפעילות המערכת" : "View your recent creations and system activity"}
                </p>
              </div>
              <button
                onClick={refreshData}
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{
                  background: "#000810",
                  border: "1px solid rgba(1, 18, 36, 0.12)",
                  color: "#FFFFFF",
                  fontWeight: 300,
                  boxShadow: "0 8px 24px -8px rgba(1, 18, 36, 0.2)",
                }}
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                {isHe ? "רענן" : "Refresh"}
              </button>
            </div>

            {creations.length > 0 ? (
              <div className="space-y-6">
                {creations.slice(0, 5).map((creation) => (
                  <div
                    key={creation.id}
                    className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(247, 242, 233, 0.95) 100%)",
                      border: "1px solid rgba(13, 35, 68, 0.08)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 18px 34px -22px rgba(13, 35, 68, 0.12)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#000810]/10 group-hover:bg-[#000810]/15 transition-colors duration-300">
                        {React.createElement(TYPE_ICON[creation.type], { size: 24, style: { color: "#000810" } })}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-1" style={{ fontWeight: 500, color: NAVY }}>
                            {typeLabel(creation.type)}
                          </h4>
                          <p className="text-sm" style={{ fontWeight: 300, color: "#5B5B5B", opacity: 0.85 }}>
                            {formatDate(creation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCopyCreation(creation)}
                          className="group/btn p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                          style={{
                          background: "rgba(1, 18, 36, 0.06)",
                          border: "1px solid rgba(1, 18, 36, 0.12)",
                          color: copiedId === creation.id ? "#4CAF50" : "#000810",
                          }}
                        >
                          {copiedId === creation.id ? (
                            <Check size={18} />
                          ) : (
                            <Copy size={18} className="group-hover/btn:text-[#000810]" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadCreation(creation)}
                          className="group/btn p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                          style={{
                          background: "rgba(1, 18, 36, 0.06)",
                          border: "1px solid rgba(1, 18, 36, 0.12)",
                          color: "#000810",
                          }}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6" style={{ background: "rgba(13, 35, 68, 0.06)", border: "2px solid rgba(13, 35, 68, 0.08)" }}>
                  <Sparkles size={40} style={{ color: NAVY, opacity: 0.6 }} />
                </div>
                <h3 className="text-2xl font-semibold mb-4" style={{ fontWeight: 500, color: NAVY }}>
                  {isHe ? "אין פעילות עדיין" : "No Activity Yet"}
                </h3>
                <p className="text-lg max-w-md mx-auto mb-8" style={{ fontWeight: 300, color: "#5B5B5B", opacity: 0.9 }}>
                  {isHe ? "התחל ליצור תוכן עסקי מתקדם עם הכלים שלנו" : "Start creating advanced business content with our tools"}
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #D4AF37 0%, #C4A037 100%)",
                    color: "#000000",
                    fontWeight: 700,
                    boxShadow: "0 12px 32px -8px rgba(212, 175, 55, 0.4)",
                  }}
                >
                  <Sparkles size={20} />
                  {isHe ? "התחל עכשיו" : "Start Now"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
