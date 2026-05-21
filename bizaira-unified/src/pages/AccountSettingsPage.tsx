import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Lock } from "lucide-react";

const AccountSettingsPage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const navigate = useNavigate();
  const { profile } = useAuth();

  const profileLang = profile?.language_preference ?? profile?.locale ?? (isHe ? "he" : "en");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [targetAudience, setTargetAudience] = useState(profile?.target_audience ?? "");
  const [businessGoals, setBusinessGoals] = useState(profile?.business_goals ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(profileLang);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate("/auth?mode=login");
      return;
    }
  }, [profile, navigate]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const updates: Record<string, unknown> = {
        full_name: fullName,
        target_audience: targetAudience,
        business_goals: businessGoals,
        phone,
        language_preference: language,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", profile.user_id);

      if (profileError) throw profileError;

      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
      }

      setMessage(isHe ? "השינויים נשמרו בהצלחה." : "Changes saved successfully.");
    } catch (err: any) {
      console.error("Settings save failed:", err);
      setMessage(isHe ? "שמירת השינויים נכשלה. נסה שוב." : "Saving changes failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#000B18]" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#000B18] transition hover:bg-[#F8F9FB]"
            >
              <ArrowLeft size={18} />
              {isHe ? "חזור" : "Back"}
            </button>
            <p className="text-xs uppercase tracking-[0.35em] text-[#64748B]">
              {isHe ? "הגדרות חשבון" : "Account Settings"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#000B18]">
              {isHe ? "הגדרות חשבון ועסק" : "Account & Business Settings"}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#475569]">
              {isHe ? "ניהול המידע האישי והעדפות המערכת שלך" : "Manage your personal information and system preferences."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-3xl border border-[#000B18] bg-white px-6 py-3 text-sm font-semibold text-[#000B18] transition hover:bg-[#000B18] hover:text-white"
            >
              {isHe ? "ביטול" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-3xl bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001830] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (isHe ? "שומר..." : "Saving...") : isHe ? "שמור שינויים" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-10">
          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_40px_rgba(0,11,24,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#64748B]">
                  {isHe ? "פרופיל ונתוני עסק" : "Business Profile Data"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#000B18]">
                  {isHe ? "פרטי העסק שלך" : "Your business details"}
                </h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "שם מלא" : "Full Name"}</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isHe ? "השם שלך" : "Your name"}
                  className="w-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFD] px-4 py-4 text-sm text-[#000B18] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                  dir={isHe ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "קהל יעד" : "Target Audience"}</label>
                <input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={isHe ? "לדוגמה: עסקים קטנים, סטארטאפים" : "E.g., small businesses, startups"}
                  className="w-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFD] px-4 py-4 text-sm text-[#000B18] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                  dir={isHe ? "rtl" : "ltr"}
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "יעדי עסק" : "Business Goals"}</label>
                <textarea
                  value={businessGoals}
                  onChange={(e) => setBusinessGoals(e.target.value)}
                  placeholder={isHe ? "תאר את היעדים העיקריים שלך" : "Describe your main business goals"}
                  rows={5}
                  className="w-full rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFD] px-4 py-4 text-sm text-[#000B18] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10 resize-none"
                  dir={isHe ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_40px_rgba(0,11,24,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#64748B]">
                  {isHe ? "פרטי התחברות" : "Account Credentials"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#000B18]">
                  {isHe ? "פרטי חשבון" : "Account details"}
                </h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "אימייל" : "Email"}</label>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4 text-sm text-[#64748B] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "מספר טלפון" : "Phone Number"}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isHe ? "050-1234567" : "+972-50-1234567"}
                  className="w-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFD] px-4 py-4 text-sm text-[#000B18] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                  dir="ltr"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "שינוי סיסמה" : "Change Password"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isHe ? "הזן סיסמה חדשה" : "Enter a new password"}
                  className="w-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFD] px-4 py-4 text-sm text-[#000B18] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_40px_rgba(0,11,24,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#64748B]">
                  {isHe ? "העדפות מערכת" : "System Preferences"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#000B18]">
                  {isHe ? "העדפות תוכנה" : "System preferences"}
                </h2>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#000B18]">{isHe ? "שפת מערכת" : "System Language"}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFD] px-4 py-4 text-sm text-[#000B18] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                  dir={isHe ? "rtl" : "ltr"}
                >
                  <option value="he">{isHe ? "עברית" : "Hebrew"}</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </section>

          {message && (
            <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4 text-sm text-[#000B18]">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
