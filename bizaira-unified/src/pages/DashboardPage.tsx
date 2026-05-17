import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wand2,
  CreditCard,
  HeadphonesIcon,
  TrendingUp,
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

const TYPE_ICON: Record<CreationType, React.ComponentType<any>> = {
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
  const userName = user?.user_metadata?.full_name || t("dash.guest");

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
      title: t("dash.startCreate"),
      description: t("dash.startCreateDesc"),
      icon: Wand2,
      href: "/create",
      primary: true,
      color: "#000810",
    },
    {
      title: t("dash.personalAreaTitle"),
      description: t("dash.personalAreaDesc"),
      icon: User,
      href: "/profile",
      primary: false,
      color: "#000810",
    },
    {
      title: t("dash.activity"),
      description: t("dash.activityDesc"),
      icon: TrendingUp,
      href: "/dashboard",
      primary: false,
      color: "#000810",
    },
    {
      title: t("dash.manageSub"),
      description: t("dash.manageSubDesc"),
      icon: CreditCard,
      href: "/pricing",
      primary: false,
      color: "#000810",
    },
    {
      title: t("dash.supportTitle"),
      description: t("dash.supportDesc"),
      icon: HeadphonesIcon,
      href: "/support",
      primary: false,
      color: "#000810",
    },
  ];

  const hasName = !!user?.user_metadata?.full_name;
  const greetingTitle = hasName ? t("dash.greetingName", { name: userName }) : t("dash.welcomeGuest");
  const greetingSubtitle = hasName
    ? t("dash.personalAreaWelcome")
    : t("dash.personalWorkspace");
  const mainHeader = t("dash.welcomePrompt");

  const MIDNIGHT_BLUE = "#001830";
  const CREAM = "#F5F5DC";
  const PURE_WHITE = "#FFFFFF";
  const CARD_RADIUS = "12px";

  return (
    <div className="min-h-screen bg-white text-[#001830]" style={{ fontFamily: "'Inter', 'System-ui', -apple-system, sans-serif" }}>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 pt-24 pb-20">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-[#001830]/40 mb-6" style={{ fontWeight: 500 }}>{t("dash.personalAreaTitle")}</p>
            <h1 className="mx-auto max-w-3xl text-5xl md:text-6xl font-bold leading-tight" style={{ color: MIDNIGHT_BLUE, fontFamily: "'Inter', sans-serif" }}>
              {mainHeader}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9" style={{ color: "#001830", opacity: 0.55, fontWeight: 400 }}>
              {hasName ? `${greetingTitle} ${greetingSubtitle}` : greetingSubtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group relative overflow-hidden bg-white text-[#001830] transition-all duration-300 ease-in-out hover:-translate-y-1.5"
                  style={{
                    borderRadius: CARD_RADIUS,
                    border: "1px solid rgba(0, 24, 48, 0.12)",
                    padding: "2rem",
                    boxShadow: "0 1px 3px rgba(0, 24, 48, 0.08)",
                  }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-5">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white transition-colors duration-300" style={{ border: "1px solid rgba(0, 24, 48, 0.1)" }}>
                        <IconComponent size={20} strokeWidth={1.25} style={{ color: MIDNIGHT_BLUE }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold leading-snug" style={{ color: MIDNIGHT_BLUE, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{card.title}</h3>
                        <p className="mt-2 text-sm leading-6" style={{ color: "#001830", opacity: 0.6, fontWeight: 400 }}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-10">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="bg-white p-5" style={{ borderRadius: CARD_RADIUS, border: "1px solid rgba(0, 24, 48, 0.12)", boxShadow: "0 1px 3px rgba(0, 24, 48, 0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ border: "1px solid rgba(0, 24, 48, 0.1)", backgroundColor: "#F5F5DC" }}>
                <TrendingUp size={18} color={MIDNIGHT_BLUE} strokeWidth={1.25} />
              </div>
              <span className="text-xl font-bold" style={{ color: MIDNIGHT_BLUE, fontFamily: "'Inter', sans-serif" }}>{profile?.credits_used || 0}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: "#001830", opacity: 0.6 }}>{t("dash.creditsUsed")}</p>
            <div className="mt-3 w-full rounded-full h-1" style={{ backgroundColor: "rgba(0, 24, 48, 0.08)" }}>
              <div className="h-1 rounded-full" style={{ width: profile?.credits_total ? `${(profile.credits_used / profile.credits_total) * 100}%` : "0%", backgroundColor: MIDNIGHT_BLUE }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#001830", opacity: 0.5 }}>{profile?.credits_used || 0}/{profile?.credits_total || 0}</p>
          </div>

          <div className="bg-white p-5" style={{ borderRadius: CARD_RADIUS, border: "1px solid rgba(0, 24, 48, 0.12)", boxShadow: "0 1px 3px rgba(0, 24, 48, 0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ border: "1px solid rgba(0, 24, 48, 0.1)", backgroundColor: "#F5F5DC" }}>
                <Wand2 size={18} color={MIDNIGHT_BLUE} strokeWidth={1.25} />
              </div>
              <span className="text-xl font-bold" style={{ color: MIDNIGHT_BLUE, fontFamily: "'Inter', sans-serif" }}>{stats.creationsCount}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: "#001830", opacity: 0.6 }}>{t("dash.aiGenerations")}</p>
            <div className="mt-3 w-full rounded-full h-1" style={{ backgroundColor: "rgba(0, 24, 48, 0.08)" }}>
              <div className="h-1 rounded-full" style={{ width: "0%", backgroundColor: MIDNIGHT_BLUE }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#001830", opacity: 0.5 }}>{stats.creationsCount}/∞</p>
          </div>

          <div className="bg-white p-5" style={{ borderRadius: CARD_RADIUS, border: "1px solid rgba(0, 24, 48, 0.12)", boxShadow: "0 1px 3px rgba(0, 24, 48, 0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ border: "1px solid rgba(0, 24, 48, 0.1)", backgroundColor: "#F5F5DC" }}>
                <MessageSquare size={18} color={MIDNIGHT_BLUE} strokeWidth={1.25} />
              </div>
              <span className="text-xl font-bold" style={{ color: MIDNIGHT_BLUE, fontFamily: "'Inter', sans-serif" }}>{stats.downloadsCount}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: "#001830", opacity: 0.6 }}>{t("dash.messagesSent")}</p>
            <div className="mt-3 w-full rounded-full h-1" style={{ backgroundColor: "rgba(0, 24, 48, 0.08)" }}>
              <div className="h-1 rounded-full" style={{ width: "0%", backgroundColor: MIDNIGHT_BLUE }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#001830", opacity: 0.5 }}>{stats.downloadsCount}/∞</p>
          </div>

          <div className="bg-white p-5" style={{ borderRadius: CARD_RADIUS, border: "1px solid rgba(0, 24, 48, 0.12)", boxShadow: "0 1px 3px rgba(0, 24, 48, 0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ border: "1px solid rgba(0, 24, 48, 0.1)", backgroundColor: "#F5F5DC" }}>
                <BarChart3 size={18} color={MIDNIGHT_BLUE} strokeWidth={1.25} />
              </div>
              <span className="text-xl font-bold" style={{ color: MIDNIGHT_BLUE, fontFamily: "'Inter', sans-serif" }}>{stats.deletionsCount}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: "#001830", opacity: 0.6 }}>{t("dash.deletions")}</p>
            <div className="mt-3 w-full rounded-full h-1" style={{ backgroundColor: "rgba(0, 24, 48, 0.08)" }}>
              <div className="h-1 rounded-full" style={{ width: "0%", backgroundColor: MIDNIGHT_BLUE }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#001830", opacity: 0.5 }}>{stats.deletionsCount}/∞</p>
          </div>
        </div>

        <div className="text-center">
          <button className="px-8 py-4 rounded-lg text-white font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-1" style={{ backgroundColor: MIDNIGHT_BLUE, boxShadow: "0 2px 8px rgba(0, 24, 48, 0.16)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
            {t("dash.upgradeNow")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="border bg-white p-10" style={{ borderRadius: CARD_RADIUS, borderColor: "rgba(2, 8, 23, 0.08)", boxShadow: "0 24px 48px -12px rgba(2, 8, 23, 0.12)" }}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
            <div>
              <h2 className="text-4xl font-semibold mb-4" style={{ fontWeight: 300, color: MIDNIGHT_BLUE }}>
                {t("dash.recentActivityTitle")}
              </h2>
              <p className="text-lg max-w-2xl" style={{ fontWeight: 300, color: "#3B4A66", opacity: 0.9 }}>
                {t("dash.recentActivityDesc")}
              </p>
            </div>
            <button
              onClick={refreshData}
              className="inline-flex items-center gap-3 rounded-2xl px-6 py-3 transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1"
              style={{ backgroundColor: MIDNIGHT_BLUE, color: PURE_WHITE, border: "1px solid rgba(2, 8, 23, 0.12)", fontWeight: 300, boxShadow: "0 8px 24px -8px rgba(2, 8, 23, 0.2)" }}
            >
              <RefreshCw size={20} className="transition-transform duration-500" />
              {t("dash.refresh")}
            </button>
          </div>

          {creations.length > 0 ? (
            <div className="space-y-6">
              {creations.slice(0, 5).map((creation) => (
                <div
                  key={creation.id}
                  className="group border bg-[#FAF9F6] p-6 transition-all duration-300 ease-in-out hover:-translate-y-1"
                  style={{ borderRadius: CARD_RADIUS, borderColor: "rgba(2, 8, 23, 0.08)", boxShadow: "0 18px 34px -22px rgba(2, 8, 23, 0.12)" }}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#020817]/10 transition-colors duration-300 ease-in-out group-hover:bg-[#020817]/15">
                        {React.createElement(TYPE_ICON[creation.type], { size: 24, className: "text-[#020817]" })}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1" style={{ fontWeight: 500, color: MIDNIGHT_BLUE }}>
                          {typeLabel(creation.type)}
                        </h4>
                        <p className="text-sm" style={{ fontWeight: 300, color: "#3B4A66", opacity: 0.85 }}>
                          {formatDate(creation.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopyCreation(creation)}
                        className="rounded-2xl border p-3 transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-1"
                        style={{ backgroundColor: "rgba(2, 8, 23, 0.06)", borderColor: "rgba(2, 8, 23, 0.12)", color: copiedId === creation.id ? "#34D399" : MIDNIGHT_BLUE }}
                      >
                        {copiedId === creation.id ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      <button
                        onClick={() => handleDownloadCreation(creation)}
                        className="rounded-2xl border p-3 transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-1"
                        style={{ backgroundColor: "rgba(2, 8, 23, 0.06)", borderColor: "rgba(2, 8, 23, 0.12)", color: MIDNIGHT_BLUE }}
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
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-[rgba(2,8,23,0.08)] bg-[#020817]/5">
                <BarChart3 size={32} className="text-[#020817]/70" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontWeight: 500, color: MIDNIGHT_BLUE }}>
                {t("dash.noActivityYet")}
              </h3>
              <p className="text-lg max-w-md mx-auto mb-8" style={{ fontWeight: 300, color: "#3B4A66", opacity: 0.9 }}>
                {t("dash.noActivityDesc")}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center justify-center rounded-2xl px-8 py-4 transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1"
                style={{ backgroundColor: MIDNIGHT_BLUE, color: PURE_WHITE, fontWeight: 600, boxShadow: "0 16px 40px -16px rgba(2, 8, 23, 0.24)" }}
              >
                {t("dash.startNow")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
