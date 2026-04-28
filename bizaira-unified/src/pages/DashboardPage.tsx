import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import {
  loadCreations,
  trackDownload,
  type Creation,
  type CreationType,
} from "@/lib/creations-store";

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
  const { user } = useAuth();
  const isHe = lang === "he";
  const userName = user?.user_metadata?.full_name || (isHe ? "אורח" : "Guest");

  const [creations, setCreations] = useState<Creation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    setCreations(loadCreations());
  }, []);

  useEffect(() => {
    refreshData();
    window.addEventListener("storage", refreshData);
    return () => window.removeEventListener("storage", refreshData);
  }, [refreshData]);

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

  return (
    <div className="min-h-screen bg-luxury-navy pb-12" dir={isHe ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="mb-16 animate-fade-in text-center">
          <h1 className="luxury-heading text-4xl md:text-5xl mb-4">
            {isHe ? `שלום ${userName}, מה תרצה לבנות היום?` : `Hello ${userName}, what would you like to build today?`}
          </h1>
          <p className="luxury-body text-luxury-gray-300 max-w-2xl mx-auto">
            {isHe ? "הכלי המתקדמים שלך ליצירת תוכן עסקי מקצועי" : "Your advanced tools for creating professional business content"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link
            to="/create"
            className="group luxury-card rounded-2xl p-8 bg-luxury-gray-900/50 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold/10 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-luxury-gold/10 group-hover:bg-luxury-gold/20 transition-colors">
                <Wand2 size={24} className="text-luxury-gold" />
              </div>
            </div>
            <h3 className="luxury-heading text-xl mb-2 text-luxury-cream">
              {isHe ? "התחל ליצור" : "Start Creating"}
            </h3>
            <p className="luxury-description text-luxury-gray-400">
              {isHe ? "צור תוכן עסקי מתקדם עם AI" : "Create advanced business content with AI"}
            </p>
          </Link>

          <Link
            to="/profile"
            className="luxury-card rounded-2xl p-8 bg-luxury-gray-900/50 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold/10 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-luxury-gold/10 hover:bg-luxury-gold/20 transition-colors">
                <User size={24} className="text-luxury-gold" />
              </div>
            </div>
            <h3 className="luxury-heading text-xl mb-2 text-luxury-cream">
              {isHe ? "אזור אישי" : "Personal Area"}
            </h3>
            <p className="luxury-description text-luxury-gray-400">
              {isHe ? "נהל את הפרופיל וההעדפות שלך" : "Manage your profile and preferences"}
            </p>
          </Link>

          <div className="luxury-card rounded-2xl p-8 bg-luxury-gray-900/50 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold/10 hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-luxury-gold/10 hover:bg-luxury-gold/20 transition-colors">
                <TrendingUp size={24} className="text-luxury-gold" />
              </div>
            </div>
            <h3 className="luxury-heading text-xl mb-2 text-luxury-cream">
              {isHe ? "מעקב פעילות" : "Activity Tracker"}
            </h3>
            <p className="luxury-description text-luxury-gray-400">
              {isHe ? "צפה בסטטיסטיקות השימוש שלך" : "View your usage statistics"}
            </p>
          </div>

          <Link
            to="/pricing"
            className="luxury-card rounded-2xl p-8 bg-luxury-gray-900/50 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold/10 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-luxury-gold/10 group-hover:bg-luxury-gold/20 transition-colors">
                <CreditCard size={24} className="text-luxury-gold" />
              </div>
            </div>
            <h3 className="luxury-heading text-xl mb-2 text-luxury-cream">
              {isHe ? "ניהול מנוי" : "Subscription"}
            </h3>
            <p className="luxury-description text-luxury-gray-400">
              {isHe ? "נהל את התוכנית והתשלומים שלך" : "Manage your plan and payments"}
            </p>
          </Link>

          <Link
            to="/support"
            className="luxury-card rounded-2xl p-8 bg-luxury-gray-900/50 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold/10 hover:scale-[1.02] md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-luxury-gold/10 group-hover:bg-luxury-gold/20 transition-colors">
                <HeadphonesIcon size={24} className="text-luxury-gold" />
              </div>
            </div>
            <h3 className="luxury-heading text-xl mb-2 text-luxury-cream">
              {isHe ? "תמיכה" : "Support"}
            </h3>
            <p className="luxury-description text-luxury-gray-400">
              {isHe ? "קבל עזרה ותמיכה מקצועית" : "Get help and professional support"}
            </p>
          </Link>
        </div>

        <div className="luxury-card rounded-2xl p-8 bg-luxury-gray-900/30 border border-luxury-gold/10">
          <h3 className="luxury-heading text-2xl mb-6 text-luxury-cream">
            {isHe ? "פעילות אחרונה" : "Recent Activity"}
          </h3>

          {creations.length > 0 ? (
            <div className="space-y-4">
              {creations.slice(0, 5).map((creation) => (
                <div key={creation.id} className="flex items-center justify-between p-4 bg-luxury-gray-800/50 rounded-xl border border-luxury-gold/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-luxury-gold/10">
                      {React.createElement(TYPE_ICON[creation.type], { size: 20, className: "text-luxury-gold" })}
                    </div>
                    <div>
                      <p className="luxury-body font-medium text-luxury-cream">{typeLabel(creation.type)}</p>
                      <p className="luxury-description text-luxury-gray-400 text-sm">{formatDate(creation.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCreation(creation)}
                      className="p-2 rounded-lg hover:bg-luxury-gold/10 transition-colors"
                    >
                      {copiedId === creation.id ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-luxury-gray-400 hover:text-luxury-gold" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadCreation(creation)}
                      className="p-2 rounded-lg hover:bg-luxury-gold/10 transition-colors"
                    >
                      <Download size={16} className="text-luxury-gray-400 hover:text-luxury-gold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles size={48} className="text-luxury-gold/30 mx-auto mb-4" />
              <p className="luxury-body text-luxury-gray-400">
                {isHe ? "אין פעילות עדיין. התחל ליצור!" : "No activity yet. Start creating!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
