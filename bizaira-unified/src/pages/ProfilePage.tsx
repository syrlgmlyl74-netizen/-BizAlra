import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { getActivityStats } from "@/lib/activity-tracker";
import { UserCircle2, Headphones, CreditCard, Settings } from "lucide-react";

const ProfilePage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const navigate = useNavigate();
  const { profile } = useAuth();

  const stats = getActivityStats();
  const totalCredits = stats.limit;
  const remainingCredits = stats.remainingActions;
  const renewalDateLabel = stats.nextRenewalDate
    ? stats.nextRenewalDate.toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
    : isHe
      ? "לא זמין"
      : "N/A";
  const renewalCountdown = useMemo(() => {
    if (!stats.nextRenewalDate) return null;
    const diffMs = stats.nextRenewalDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [stats.nextRenewalDate]);
  const isPro = profile?.plan === "pro";
  const planLabel = isPro ? "PRO" : isHe ? "תוכנית חינם" : "Free Plan";
  const userName = profile?.full_name ?? profile?.email ?? (isHe ? "משתמש BizAIra" : "BizAIra User");
  const studioStatus = isPro ? (isHe ? "גישה בלתי מוגבלת לסטודיו" : "Unlimited studio access") : isHe ? "גישה פעילה לסטודיו" : "Studio access active";
  const creditPercent = isPro ? 100 : Math.round((remainingCredits / Math.max(totalCredits, 1)) * 100);

  return (
    <div className="min-h-screen bg-soft-cream text-[#001830]" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="max-w-4xl mx-auto text-right">
            <p className="luxury-page-eyebrow mb-3">
              {isHe ? "מרכז הניהול" : "Account Center"}
            </p>
            <h1 className="luxury-page-title">
              {isHe ? "אזור אישי" : "Personal Area"}
            </h1>
            <p className="luxury-page-copy mt-3">
              {isHe ? "ניהול פרטי החשבון והגדרות העסק שלך" : "Manage your account details and business settings"}
            </p>
          </div>
        </header>

        <section className="luxury-card p-8 text-right">          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-cream text-[#001830]">
                <UserCircle2 size={30} />
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.26em] text-[#001830]/80">{planLabel}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#001830]">{isHe ? `ברוכה השבה, ${userName}` : `Welcome back, ${userName}`}</h2>
                <p className="mt-1 text-sm text-soft-muted">{studioStatus}</p>
              </div>
            </div>

            <div className="space-y-3 text-right">
              <p className="text-sm font-semibold text-[#000B18]">{isHe ? `נשארו קרדיטים: ${remainingCredits} / ${totalCredits}` : `Credits remaining: ${remainingCredits} / ${totalCredits}`}</p>
              <p className="text-sm text-slate-500">{isHe ? `תאריך חידוש: ${renewalDateLabel}` : `Renewal date: ${renewalDateLabel}`}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm font-medium text-[#000B18]">
              <span>{isHe ? "סטטוס קרדיטים" : "Credit balance"}</span>
              <span>{`${creditPercent}%`}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#000B18] transition-all duration-300" style={{ width: `${creditPercent}%` }} />
            </div>
            <div className="mt-4 rounded-2xl border border-[#001830]/10 bg-[#FAFBFC] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-soft-muted">{isHe ? "החידוש הבא" : "Next renewal"}</p>
              <p className="mt-2 text-lg font-bold text-[#001830]">{renewalCountdown !== null ? (isHe ? `בעוד ${renewalCountdown} ימים` : `${renewalCountdown} days left`) : (isHe ? "לא זמין כרגע" : "Not available right now")}</p>
              <p className="mt-1 text-sm text-slate-600">{isHe ? `תאריך חידוש: ${renewalDateLabel}` : `Renewal date: ${renewalDateLabel}`}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 luxury-card p-6 text-right">
          <div className="mb-4">
            <p className="luxury-page-eyebrow text-right">{isHe ? "כלי ניהול מהירים" : "Quick actions"}</p>
            <h3 className="luxury-card-title mt-2 text-right text-xl">{isHe ? "ניהול חשבון וסטודיו" : "Account & studio controls"}</h3>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/support")}
              className="luxury-card group w-full text-right transition duration-300 hover:-translate-y-0.5 hover:shadow-soft-business"
            >
              <div className="luxury-card-row items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#001830]/10 text-[#001830]">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <p className="luxury-card-title text-sm">{isHe ? "תמיכה" : "Support"}</p>
                    <p className="luxury-card-text text-xs">{isHe ? "עזרה מהירה ומענה מקצועי" : "Quick help and expert guidance"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#001830]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#001830]/70">
                  {isHe ? "פתח" : "Open"}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="luxury-card group w-full text-right transition duration-300 hover:-translate-y-0.5 hover:shadow-soft-business"
            >
              <div className="luxury-card-row items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#001830]/10 text-[#001830]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="luxury-card-title text-sm">{isHe ? "ניהול מנוי" : "Manage subscription"}</p>
                    <p className="luxury-card-text text-xs">{isHe ? "סקירת תכנית והתאמות" : "Review your plan and upgrade options"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#001830]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#001830]/70">
                  {isHe ? "פתח" : "Open"}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="luxury-card group w-full text-right transition duration-300 hover:-translate-y-0.5 hover:shadow-soft-business"
            >
              <div className="luxury-card-row items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#001830]/10 text-[#001830]">
                    <Settings size={20} />
                  </div>
                  <div>
                    <p className="luxury-card-title text-sm">{isHe ? "הגדרות" : "Settings"}</p>
                    <p className="luxury-card-text text-xs">{isHe ? "התאמות פרטיות ונגישות" : "Privacy and accessibility preferences"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#001830]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#001830]/70">
                  {isHe ? "פתח" : "Open"}
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
