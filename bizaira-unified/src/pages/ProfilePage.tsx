import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  BarChart3,
  CreditCard,
  HelpCircle,
  Mail,
  Briefcase,
  Target,
  Clock,
  Crown,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { getActivityStats } from "@/lib/activity-tracker";

const ProfilePage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const {
    creationsCount,
    downloadsCount,
    deletionsCount,
    generalCount,
    totalActions,
    nextRenewalDate,
    remainingActions,
    limit,
    isLocked,
  } = getActivityStats();

  const fullName = profile?.full_name || user?.user_metadata?.full_name || (isHe ? "אורח" : "Guest");
  const planLabel = profile?.plan ?? (isHe ? "חינם" : "Free");
  const usedLabel = `${totalActions}/${limit}`;
  const usagePercent = Math.min(100, Math.round((totalActions / limit) * 100));
  const renewalLabel = nextRenewalDate
    ? new Date(nextRenewalDate).toLocaleDateString(isHe ? "he-IL" : "en-US", {
        day: "numeric",
        month: "short",
      })
    : isHe
    ? "טרם נעשה שימוש"
    : "No usage yet";

  const cards = [
    {
      title: isHe ? "סטודיו" : "Studio",
      description: isHe ? "גשו לכלי היצירה ולסטודיו החכם" : "Access the creation tools and smart studio",
      icon: Sparkles,
      href: "/create",
    },
    {
      title: isHe ? "אזור אישי" : "Personal Area",
      description: isHe ? "המשך לנהל את ההגדרות והסטטוס שלך" : "Continue managing your settings and status",
      icon: User,
      href: "/profile",
    },
    {
      title: isHe ? "פעילות" : "Activity",
      description: isHe ? "צפו בסטטיסטיקות השימוש שלכם" : "See your usage statistics",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      title: isHe ? "ניהול מנוי" : "Subscription",
      description: isHe ? "בדקו את התכנית והצעות השדרוג" : "Review your plan and upgrade options",
      icon: CreditCard,
      href: "/pricing",
    },
    {
      title: isHe ? "תמיכה" : "Support",
      description: isHe ? "קבלו מענה מקצועי וזריז" : "Get fast professional support",
      icon: HelpCircle,
      href: "/support",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9FAFB", color: "#0D2344" }} dir={isHe ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <header className="rounded-[32px] border border-white/70 bg-white/90 p-10 shadow-[0_30px_80px_-40px_rgba(9,17,34,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                {isHe ? "אזור אישי" : "Personal Area"}
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{ fontFamily: "Assistant, sans-serif" }}>
                {isHe ? `ברוכה השבה, ${fullName}` : `Welcome back, ${fullName}`}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#4B5163]" style={{ fontFamily: "Heebo, sans-serif" }}>
                {isHe
                  ? "מרחב פרטי לניהול סטטוס התוכנית, פעילות היצירה והקרדיטים החודשיים שלך." 
                  : "A refined personal area to manage your plan status, creation activity, and monthly credits."}
              </p>
            </div>
            <div className="rounded-[28px] border border-[#E9E4DA] bg-white p-6 shadow-[0_18px_50px_-32px_rgba(14,24,56,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-2" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                {isHe ? "תוכנית נוכחית" : "Current Plan"}
              </p>
              <p className="text-2xl font-semibold text-[#0B1E3B] mb-3" style={{ fontFamily: "Assistant, sans-serif" }}>
                {planLabel}
              </p>
              <p className="text-sm text-[#4B5163] mb-4" style={{ fontFamily: "Heebo, sans-serif" }}>
                {isHe ? "Free Plan כולל עד 5 פעולות חודשיות בחינם" : "Free Plan includes up to 5 monthly actions free"}
              </p>
              <div className="flex items-center gap-3 text-sm text-[#0B1E3B] font-medium" style={{ fontFamily: "Heebo, sans-serif" }}>
                <Clock size={18} />
                <span>{isHe ? "הקרדיטים יתחדש בתאריך" : "Your credits will refresh on"}</span>
                <span className="font-semibold">{renewalLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-[32px] border border-[#E9E4DA] bg-white p-8 shadow-[0_24px_60px_-40px_rgba(9,17,34,0.18)]">
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-2" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                    {isHe ? "קרדיט חודשי" : "Monthly Credit"}
                  </p>
                  <h2 className="text-3xl font-semibold text-[#0B1E3B]" style={{ fontFamily: "Assistant, sans-serif" }}>
                    {usedLabel}
                  </h2>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${isLocked ? "bg-[#F8E9E1] text-[#9B2D14]" : "bg-[#E4F0FF] text-[#0B1E3B]"}`}>
                  {isLocked ? (isHe ? "מנעל פעול" : "Studio locked") : isHe ? "עדיין פתוח" : "Studio active"}
                </span>
              </div>
              <div className="relative h-4 overflow-hidden rounded-full bg-[#E9E4DA]">
                <div className="absolute inset-y-0 left-0 rounded-full bg-[#0B1E3B] transition-all duration-500" style={{ width: `${usagePercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-[#4B5163]" style={{ fontFamily: "Heebo, sans-serif" }}>
                <span>{isHe ? "משתמש" : "Used"}</span>
                <span>{isHe ? "מקסימום" : "Limit"}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] bg-white p-5 border border-[#E9E4DA]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                  {isHe ? "יצירות" : "Created"}
                </p>
                <p className="text-3xl font-semibold text-[#0B1E3B]" style={{ fontFamily: "Assistant, sans-serif" }}>
                  {creationsCount}
                </p>
              </div>
              <div className="rounded-[24px] bg-white p-5 border border-[#E9E4DA]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                  {isHe ? "הורדות" : "Downloads"}
                </p>
                <p className="text-3xl font-semibold text-[#0B1E3B]" style={{ fontFamily: "Assistant, sans-serif" }}>
                  {downloadsCount}
                </p>
              </div>
              <div className="rounded-[24px] bg-white p-5 border border-[#E9E4DA]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                  {isHe ? "מחיקות" : "Deletions"}
                </p>
                <p className="text-3xl font-semibold text-[#0B1E3B]" style={{ fontFamily: "Assistant, sans-serif" }}>
                  {deletionsCount}
                </p>
              </div>
              <div className="rounded-[24px] bg-white p-5 border border-[#E9E4DA]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                  {isHe ? "פעילויות כלליות" : "General Actions"}
                </p>
                <p className="text-3xl font-semibold text-[#0B1E3B]" style={{ fontFamily: "Assistant, sans-serif" }}>
                  {generalCount}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-[#E9E4DA] bg-white p-6">
              <div className="flex items-center gap-3 text-sm text-[#4B5163]" style={{ fontFamily: "Heebo, sans-serif" }}>
                <Clock size={18} />
                <span>{isHe ? "הקרדיטים יתחדשו ב" : "Credits refresh on"}</span>
                <strong className="text-[#0B1E3B]">{renewalLabel}</strong>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#475569]" style={{ fontFamily: "Heebo, sans-serif" }}>
                {isHe
                  ? "הסטודיו נחסם עם חמש פעולות, אבל המשתמש יכול לשדרג בכל עת כדי לשמור על המשכיות עבודה." 
                  : "The studio locks after five actions, but you can upgrade anytime to keep creating without interruption."}
              </p>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-[#E9E4DA] bg-[#0B1E3B] p-8 text-white shadow-[0_24px_80px_-40px_rgba(9,17,34,0.45)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#A9C7F1] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                {isHe ? "שדרוג" : "Upgrade"}
              </p>
              <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Assistant, sans-serif" }}>
                {isHe ? "שדרגו ל-PRO" : "Upgrade to PRO"}
              </h2>
              <p className="text-sm leading-7 text-[#D9E7FF]" style={{ fontFamily: "Heebo, sans-serif" }}>
                {isHe
                  ? "השיגו שימוש ללא הגבלה בסטודיו, יכולות פרימיום וניהול חכם יותר של העסק שלכם." 
                  : "Unlock unlimited studio use, premium capabilities, and smarter business management."}
              </p>
              <Link
                to="/pricing"
                className="mt-6 inline-flex w-full items-center justify-center rounded-[18px] bg-[#F8E4B9] px-6 py-3 text-sm font-semibold text-[#0B1E3B] shadow-sm transition hover:bg-[#F9E7C3]"
                style={{ fontFamily: "Assistant, sans-serif" }}
              >
                {isHe ? "שדרגו עכשיו" : "Upgrade now"}
              </Link>
            </div>

            <div className="rounded-[32px] border border-[#E9E4DA] bg-white p-8 shadow-[0_24px_80px_-40px_rgba(9,17,34,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#4B5163] mb-3" style={{ fontFamily: "Assistant, sans-serif", fontWeight: 700 }}>
                {isHe ? "קיצורי דרך" : "Quick Actions"}
              </p>
              <div className="grid gap-3">
                <Link
                  to="/create"
                  className="rounded-[18px] border border-[#E9E4DA] px-5 py-4 text-sm text-[#0B1E3B] transition hover:bg-[#F3ECE0]"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  {isHe ? "פתחי את הסטודיו" : "Open the studio"}
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-[18px] border border-[#E9E4DA] px-5 py-4 text-sm text-[#0B1E3B] transition hover:bg-[#F3ECE0]"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  {isHe ? "צפי בפעילות" : "View activity"}
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-[18px] border border-[#E9E4DA] px-5 py-4 text-sm text-[#0B1E3B] transition hover:bg-[#F3ECE0]"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  {isHe ? "בדקי שדרוג" : "Check upgrade"}
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
