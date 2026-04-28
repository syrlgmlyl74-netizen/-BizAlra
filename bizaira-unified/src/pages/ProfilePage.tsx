import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Briefcase,
  Target,
  Sparkles,
  Clock,
  CreditCard,
  Shield,
  Edit3,
  RefreshCw,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [consentState, setConsentState] = useState(profile?.marketing_consent ?? false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setConsentState(profile?.marketing_consent ?? false);
  }, [profile?.marketing_consent]);

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const handleConsentToggle = async () => {
    if (!user || !profile) return;
    setSavingConsent(true);
    setStatusMessage(null);

    const newConsent = !consentState;
    const { error } = await supabase
      .from("profiles")
      .update({ marketing_consent: newConsent })
      .eq("user_id", user.id)
      .single();

    setSavingConsent(false);

    if (error) {
      setStatusMessage(isHe ? "לא הצלחנו לעדכן את ההעדפה כרגע." : "Unable to update preferences right now.");
      return;
    }

    setConsentState(newConsent);
    await refreshProfile();
    setStatusMessage(isHe ? "העדפות נשמרו בהצלחה." : "Preferences saved successfully.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const fullName = profile?.full_name || user?.user_metadata?.full_name || (isHe ? "אורח" : "Guest");

  return (
    <div className="min-h-screen bg-luxury-navy pb-12" dir={isHe ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="luxury-card rounded-[32px] bg-luxury-gray-900/80 border border-luxury-gold/20 p-8 shadow-2xl shadow-luxury-gold/10 backdrop-blur-xl mb-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-luxury-gold/20 bg-luxury-gold/10 px-4 py-2 mb-4">
                <User size={22} className="text-luxury-gold" />
                <span className="luxury-caption text-luxury-cream uppercase tracking-[0.25em]">
                  {isHe ? "אזור אישי" : "Personal Area"}
                </span>
              </div>
              <h1 className="luxury-heading-2 text-luxury-cream mb-2">
                {isHe ? `ברוך הבא, ${fullName}` : `Welcome, ${fullName}`}
              </h1>
              <p className="luxury-body text-luxury-gray-300 max-w-2xl">
                {isHe
                  ? "הנה מרכז הניהול האישי שלך: פרופיל, תכנית, העדפות ושירות לקוחות בקצה הזהב של העסקים."
                  : "Your personal command center for profile, plan, preferences and premium service in one elegant place."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-2xl bg-luxury-gold px-5 py-3 text-sm font-semibold text-luxury-black shadow-lg shadow-luxury-gold/20 hover:shadow-xl transition-all"
              >
                <Edit3 size={16} />
                {isHe ? "ערוך פרופיל" : "Edit Profile"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-2xl border border-luxury-gold/30 bg-luxury-gray-900/70 px-5 py-3 text-sm text-luxury-cream hover:border-luxury-gold hover:bg-luxury-gray-800 transition-all"
              >
                <LogOut size={16} />
                {isHe ? "התנתק" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-8">
          <div className="luxury-card rounded-[32px] bg-luxury-gray-900/80 border border-luxury-gold/20 p-8 shadow-2xl shadow-luxury-gold/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="luxury-caption text-luxury-gold uppercase mb-2">
                  {isHe ? "מידע עסקי" : "Business Profile"}
                </p>
                <h2 className="luxury-heading-3 text-luxury-cream">
                  {isHe ? "פרטי המשתמש שלך" : "Your account details"}
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-luxury-gold/10 px-3 py-2 text-sm text-luxury-gold">
                <Mail size={16} />
                {profile?.email ?? user?.email ?? (isHe ? "דוא"ל לא זמין" : "No email available")}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "שם מלא" : "Full Name"}</p>
                <p className="luxury-body text-luxury-cream">{fullName}</p>
              </div>
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "סוג העסק" : "Business Type"}</p>
                <p className="luxury-body text-luxury-cream">{profile?.business_type ?? "—"}</p>
              </div>
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "קהל יעד" : "Target Audience"}</p>
                <p className="luxury-body text-luxury-cream">{profile?.target_audience ?? "—"}</p>
              </div>
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "מטרות עסקיות" : "Business Goals"}</p>
                <p className="luxury-body text-luxury-cream">{profile?.business_goals ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="luxury-card rounded-[32px] bg-luxury-gray-900/80 border border-luxury-gold/20 p-8 shadow-2xl shadow-luxury-gold/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="luxury-caption text-luxury-gold uppercase mb-2">
                  {isHe ? "תכנית ושימוש" : "Plan & Usage"}
                </p>
                <h2 className="luxury-heading-3 text-luxury-cream">
                  {isHe ? "בקרה פיננסית" : "Membership overview"}
                </h2>
              </div>
              <CreditCard size={24} className="text-luxury-gold" />
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "תכנית" : "Plan"}</p>
                <p className="luxury-body text-luxury-cream">{profile?.plan ?? (isHe ? "חיסכון חינמי" : "Free Plan")}</p>
              </div>
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "זכויות" : "Credits"}</p>
                <p className="luxury-body text-luxury-cream">{`${profile?.credits_used ?? 0} / ${profile?.credits_total ?? 0}`}</p>
              </div>
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "תאריך התחלה" : "Started"}</p>
                <p className="luxury-body text-luxury-cream">{formatDate(profile?.plan_started_at)}</p>
              </div>
              <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
                <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "חידוש אחרון" : "Last renewal"}</p>
                <p className="luxury-body text-luxury-cream">{formatDate(profile?.last_renewal_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="luxury-card rounded-[32px] bg-luxury-gray-900/80 border border-luxury-gold/20 p-8 shadow-2xl shadow-luxury-gold/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <p className="luxury-caption text-luxury-gold uppercase mb-2">
                {isHe ? "העדפות ותקשורת" : "Preferences & Communication"}
              </p>
              <h2 className="luxury-heading-3 text-luxury-cream">
                {isHe ? "שליטה אישית" : "Personal controls"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleConsentToggle}
              disabled={savingConsent || !user}
              className="inline-flex items-center gap-2 rounded-full bg-luxury-gold px-5 py-3 text-sm font-semibold text-luxury-black shadow-lg shadow-luxury-gold/10 hover:shadow-xl transition-all disabled:opacity-60"
            >
              <Shield size={16} />
              {isHe
                ? consentState
                  ? "בטל קבלת עדכונים" 
                  : "הפעל קבלת עדכונים"
                : consentState
                ? "Disable updates"
                : "Enable updates"}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
              <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "העדפות שיווק" : "Marketing"}</p>
              <p className="luxury-body text-luxury-cream">{consentState ? (isHe ? "פעיל" : "Enabled") : (isHe ? "כבוי" : "Disabled")}</p>
            </div>
            <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
              <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "סטטוס" : "Status"}</p>
              <p className="luxury-body text-luxury-cream">{profile?.onboarding_completed ? (isHe ? "מלא" : "Complete") : (isHe ? "לא מלא" : "Incomplete")}</p>
            </div>
            <div className="rounded-3xl border border-luxury-gold/10 bg-luxury-navy/80 p-5">
              <p className="luxury-caption text-luxury-gray-400 mb-2">{isHe ? "עדכון" : "Update"}</p>
              <p className="luxury-body text-luxury-cream">{statusMessage ?? (isHe ? "לא נשלחה הודעה" : "No message yet")}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-3xl border border-luxury-gold/20 bg-luxury-gray-900/70 px-4 py-3 text-sm text-luxury-cream hover:border-luxury-gold hover:bg-luxury-gray-800 transition-all"
            >
              <RefreshCw size={16} />
              {isHe ? "חזרה ללוח בקרה" : "Back to Dashboard"}
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-luxury-gold px-4 py-3 text-sm font-semibold text-luxury-black hover:shadow-lg transition-all"
            >
              <CreditCard size={16} />
              {isHe ? "ניהול מנוי" : "Manage Plan"}
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center justify-center gap-2 rounded-3xl border border-luxury-gold/20 bg-luxury-gray-900/70 px-4 py-3 text-sm text-luxury-cream hover:border-luxury-gold hover:bg-luxury-gray-800 transition-all"
            >
              <HelpCircle size={16} />
              {isHe ? "צור קשר" : "Contact Support"}
            </Link>
            <button
              type="button"
              onClick={refreshProfile}
              className="inline-flex items-center justify-center gap-2 rounded-3xl border border-luxury-gold/20 bg-luxury-gray-900/70 px-4 py-3 text-sm text-luxury-cream hover:border-luxury-gold hover:bg-luxury-gray-800 transition-all"
            >
              <Sparkles size={16} />
              {isHe ? "רענן פרופיל" : "Refresh Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
