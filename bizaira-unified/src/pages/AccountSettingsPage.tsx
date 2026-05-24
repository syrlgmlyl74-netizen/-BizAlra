import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { isGuestSession } from "@/lib/guest-session";
import { ArrowLeft, Lock, Building2, Target, Goal } from "lucide-react";

const AccountSettingsPage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const isGuest = !user && isGuestSession();

  const profileLang = profile?.language_preference ?? (isHe ? "he" : "en");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(profileLang);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile && !isGuest) {
      navigate("/auth?mode=login");
      return;
    }
  }, [profile, isGuest, navigate]);

  const handleSave = async () => {
    if (isGuest) {
      toast({
        title: isHe ? "עדיין לא נרשמת" : "Not registered",
        description: isHe
          ? "עדיין לא נרשמת, לא ניתן לעדכן פרטים באזור זה"
          : "You are not registered yet, cannot modify details in this area",
        variant: "destructive",
      });
      return;
    }

    if (!profile) return;
    setSaving(true);

    try {
      const updates: Record<string, unknown> = {
        full_name: fullName,
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

      toast({
        title: isHe ? "הצלחה" : "Success",
        description: isHe ? "השינויים נשמרו בהצלחה." : "Changes saved successfully.",
      });
    } catch (err: any) {
      console.error("Settings save failed:", err);
      toast({
        title: isHe ? "שגיאה" : "Error",
        description: isHe ? "שמירת השינויים נכשלה. נסה שוב." : "Saving changes failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#001830]" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header Section */}
        <div className="mb-12 flex flex-col gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-fit inline-flex items-center gap-2 rounded-full border border-[#000B18]/20 bg-white px-4 py-2 text-sm font-semibold text-[#001830] transition hover:bg-[#000B18] hover:text-white"
          >
            <ArrowLeft size={18} />
            {isHe ? "חזור" : "Back"}
          </button>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-[#001830] mb-2">
              {isHe ? "אזור אישי" : "Personal Area"}
            </h1>
            <p className="text-sm font-light leading-6 text-[#001830]/70">
              {isHe ? "ניהול פרטי החשבון והגדרות העסק שלך" : "Manage your account details and business settings"}
            </p>
          </div>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border-2 border-[#000B18] bg-white px-6 py-3 text-sm font-semibold text-[#001830] transition hover:bg-[#000B18] hover:text-white"
          >
            {isHe ? "ביטול" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isGuest}
            className="rounded-full bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00050D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (isHe ? "שומר..." : "Saving...") : isHe ? "שמור שינויים" : "Save Changes"}
          </button>
        </div>

        <div className="space-y-8">
          {/* Personal Information Section */}
          <section className="rounded-3xl border-2 border-[#000B18]/10 bg-white p-8 shadow-lg shadow-[#000B18]/5 backdrop-blur-sm">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-[#001830]/60">
                {isHe ? "מידע אישי" : "Personal Information"}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#001830]">
                {isHe ? "פרטים בסיסיים" : "Basic Details"}
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#001830]">
                  {isHe ? "שם מלא" : "Full Name"}
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isHe ? "השם שלך" : "Your name"}
                  disabled={isGuest}
                  className="w-full rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] px-4 py-3 text-sm text-[#001830] placeholder-[#001830]/40 transition focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  dir={isHe ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#001830]">
                  {isHe ? "אימייל" : "Email"}
                </label>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] px-4 py-3 text-sm text-[#001830]/60 focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/20"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-[#001830]/50">{isHe ? "לא ניתן לשנות אחרי הרישום" : "Cannot be changed after registration"}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#001830]">
                  {isHe ? "מספר טלפון" : "Phone Number"}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isHe ? "מספר הטלפון שלך" : "Your phone number"}
                  disabled={isGuest}
                  className="w-full rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] px-4 py-3 text-sm text-[#001830] placeholder-[#001830]/40 transition focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#001830]">
                  {isHe ? "שינוי סיסמה" : "Change Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isHe ? "הזן סיסמה חדשה (אופציונלי)" : "Enter new password (optional)"}
                  disabled={isGuest}
                  className="w-full rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] px-4 py-3 text-sm text-[#001830] placeholder-[#001830]/40 transition focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          {/* Onboarding Answers Section */}
          {profile && (
            <section className="rounded-3xl border-2 border-[#000B18]/10 bg-white p-8 shadow-lg shadow-[#000B18]/5 backdrop-blur-sm">
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-widest text-[#001830]/60">
                  {isHe ? "פרופיל העסק" : "Business Profile"}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-[#001830]">
                  {isHe ? "תשובות הרישום" : "Onboarding Answers"}
                </h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {profile?.business_type && (
                  <div className={`rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] p-4 ${isGuest ? 'opacity-60' : ''}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <Building2 size={18} className="text-[#001830]/60" />
                      <label className="text-xs font-semibold uppercase tracking-widest text-[#001830]/60">
                        {isHe ? "סוג עסק" : "Business Type"}
                      </label>
                    </div>
                    <p className="text-sm font-medium text-[#001830]">{profile.business_type}</p>
                  </div>
                )}

                {profile?.target_audience && (
                  <div className={`rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] p-4 ${isGuest ? 'opacity-60' : ''}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <Target size={18} className="text-[#001830]/60" />
                      <label className="text-xs font-semibold uppercase tracking-widest text-[#001830]/60">
                        {isHe ? "קהל יעד" : "Target Audience"}
                      </label>
                    </div>
                    <p className="text-sm font-medium text-[#001830]">{profile.target_audience}</p>
                  </div>
                )}

                {profile?.business_goals && (
                  <div className={`lg:col-span-2 rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] p-4 ${isGuest ? 'opacity-60' : ''}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <Goal size={18} className="text-[#001830]/60" />
                      <label className="text-xs font-semibold uppercase tracking-widest text-[#001830]/60">
                        {isHe ? "יעדי עסק" : "Business Goals"}
                      </label>
                    </div>
                    <p className="text-sm font-medium text-[#001830]">{profile.business_goals}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* System Preferences Section */}
          <section className="rounded-3xl border-2 border-[#000B18]/10 bg-white p-8 shadow-lg shadow-[#000B18]/5 backdrop-blur-sm">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-[#001830]/60">
                {isHe ? "הגדרות" : "Settings"}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#001830]">
                {isHe ? "העדפות מערכת" : "System Preferences"}
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#001830]">
                  {isHe ? "שפה" : "Language"}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGuest}
                  className="w-full rounded-2xl border-2 border-[#000B18]/10 bg-[#F8F9FA] px-4 py-3 text-sm text-[#001830] transition focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  dir={isHe ? "rtl" : "ltr"}
                >
                  <option value="he">{isHe ? "עברית" : "Hebrew"}</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </section>

          {/* Guest State Info */}
          {isGuest && (
            <div className="rounded-3xl border-2 border-[#000B18]/20 bg-[#F8F9FA] p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-[#001830]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#001830]">
                    {isHe ? "משתמש אורח" : "Guest User"}
                  </h3>
                  <p className="mt-1 text-sm text-[#001830]/70">
                    {isHe
                      ? "כדי לעדכן את הפרטים שלך ולשמור את התוכנית, אנא השלם את תהליך ההרשמה"
                      : "To update your details and save your plan, please complete the registration process"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
