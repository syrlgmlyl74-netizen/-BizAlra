import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createGuestSession, updateGuestSession, getSavedGuestAnswers } from "@/lib/guest-session";

const MIDNIGHT_BLACK = "#001F3F";
const INPUT_BG = "#F9F9FB";
const PEARL_WHITE = "#F9FAFB";

interface AuthGatewayProps {
  onComplete: (mode: "guest" | "auth") => void;
  onboardingData?: {
    business_type: string;
    target_audience: string;
    business_goals: string;
  };
}

const AuthGateway = ({ onComplete, onboardingData }: AuthGatewayProps) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const isHe = lang === "he";
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && (!name || !email || !password || !phone)) {
      toast.error(isHe ? "נא למלא את כל השדות" : "Please fill in all fields");
      return;
    }
    if (!isLogin && !agreePolicy) {
      toast.error(isHe ? "אנא קבל את מדיניות האבטחה" : "Please accept the security policy");
      return;
    }
    if (isLogin && (!email || !password)) {
      toast.error(isHe ? "נא למלא אימייל וסיסמה" : "Please fill in email and password");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(isHe ? "התחברת בהצלחה!" : "Logged in successfully!");
        onComplete("auth");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              ...getSavedGuestAnswers(),
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success(isHe ? "החשבון נוצר! בדוק את האימייל שלך" : "Account created! Check your email");
        onComplete("auth");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    createGuestSession();
    updateGuestSession(onboardingData || {});
    onComplete("guest");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      dir={isHe ? "rtl" : "ltr"}
      style={{ backgroundColor: PEARL_WHITE }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `linear-gradient(135deg, ${MIDNIGHT_BLACK} 0%, ${MIDNIGHT_BLACK} 100%)`, boxShadow: "0 8px 24px -4px rgba(0,31,63,0.35)" }}
          >
            <Sparkles size={28} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight" style={{ color: MIDNIGHT_BLACK, fontFamily: "'Assistant', sans-serif", fontWeight: 700 }}>
            {isHe ? "הצטרף היום כדי להתחיל." : "Join today to get started."}
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight" style={{ color: MIDNIGHT_BLACK, fontFamily: "'Assistant', sans-serif", fontWeight: 700 }}>
            {isLogin ? (isHe ? "התחל עכשיו" : "Start Now") : ""}
          </h2>
          <p className="text-sm mt-3" style={{ color: "#747474" }}>
            {isLogin ? (isHe ? "התחבר כדי להמשיך" : "Sign in to continue") : (isHe ? "פתח את החשבון שלך כדי לשמור ולנהל את היצירות" : "Open your account to save and manage creations")}
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 space-y-5 transition-opacity duration-300"
          style={{ backgroundColor: "#FFFFFF", boxShadow: "0 8px 40px -8px rgba(0,31,63,0.1)" }}
        >
          {/* Name field */}
          {!isLogin && (
            <FieldWrapper label={isHe ? "שם מלא" : "Full Name"}>
              <div className="relative">
                <User
                  size={15}
                  strokeWidth={1.5}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  style={{ [isHe ? "right" : "left"]: "14px" }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isHe ? "שם מלא" : "Full Name"}
                  className="w-full rounded-2xl py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                  style={{
                    backgroundColor: INPUT_BG,
                    border: "none",
                    [isHe ? "paddingRight" : "paddingLeft"]: "40px",
                    [isHe ? "paddingLeft" : "paddingRight"]: "16px"
                  }}
                  onFocus={(e) => e.target.style.border = "1px solid #000"}
                  onBlur={(e) => e.target.style.border = "none"}
                />
              </div>
            </FieldWrapper>
          )}

          {/* Phone field */}
          {!isLogin && (
            <FieldWrapper label={isHe ? "מספר טלפון" : "Phone Number"}>
              <div className="relative">
                <Phone
                  size={15}
                  strokeWidth={1.5}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  style={{ [isHe ? "right" : "left"]: "14px" }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={isHe ? "050-1234567" : "+972-50-1234567"}
                  dir="ltr"
                  className="w-full rounded-2xl py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                  style={{
                    backgroundColor: INPUT_BG,
                    border: "none",
                    [isHe ? "paddingRight" : "paddingLeft"]: "40px",
                    [isHe ? "paddingLeft" : "paddingRight"]: "16px"
                  }}
                  onFocus={(e) => e.target.style.border = "1px solid #000"}
                  onBlur={(e) => e.target.style.border = "none"}
                />
              </div>
            </FieldWrapper>
          )}

          {/* Email */}
          <FieldWrapper label={isHe ? "אימייל" : "Email"}>
            <div className="relative">
              <Mail
                size={15}
                strokeWidth={1.5}
                className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                style={{ [isHe ? "right" : "left"]: "14px" }}
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                dir="ltr"
                className="w-full rounded-2xl py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{
                  backgroundColor: INPUT_BG,
                  border: "none",
                  [isHe ? "paddingRight" : "paddingLeft"]: "40px",
                  [isHe ? "paddingLeft" : "paddingRight"]: "16px"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #000"}
                onBlur={(e) => e.target.style.border = "none"}
              />
            </div>
          </FieldWrapper>

          {/* Password */}
          <FieldWrapper label={isHe ? "סיסמה" : "Password"}>
            <div className="relative">
              <Lock
                size={15}
                strokeWidth={1.5}
                className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                style={{ [isHe ? "right" : "left"]: "14px" }}
              />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-2xl py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{
                  backgroundColor: INPUT_BG,
                  border: "none",
                  [isHe ? "paddingRight" : "paddingLeft"]: "40px",
                  [isHe ? "paddingLeft" : "paddingRight"]: "40px"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #000"}
                onBlur={(e) => e.target.style.border = "none"}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                style={{ [isHe ? "left" : "right"]: "14px" }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FieldWrapper>

          {/* Security policy */}
          {!isLogin && (
            <div className="flex items-start gap-3 mt-2">
              <input
                id="security-policy"
                type="checkbox"
                checked={agreePolicy}
                onChange={(e) => setAgreePolicy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="security-policy" className="text-sm text-gray-700">
                {isHe ? "אני מסכים למדיניות האבטחה ותנאי השירות (כולל העלאת תוכן ותמונות)." : "I agree to the security policy and terms of service (allowing content and image uploads)."}
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (!isLogin && !agreePolicy)}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: MIDNIGHT_BLACK }}
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" />
              : <Sparkles size={18} />}
            {isLogin ? (isHe ? "התחל עכשיו" : "Start Now") : (isHe ? "הרשמה" : "Sign Up")}
          </button>

          {/* Toggle */}
          <div className="text-center pt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="text-sm font-semibold transition-colors"
              style={{ color: MIDNIGHT_BLACK }}
            >
              {isLogin ? (isHe ? "אין לך חשבון? הרשם כאן" : "No account? Sign up here") : (isHe ? "כבר יש לך חשבון? התחבר כאן" : "Already have an account? Login here")}
            </button>
          </div>
        </form>

        {/* Continue as guest link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleGuest}
            className="text-sm font-medium transition-colors underline"
            style={{ color: MIDNIGHT_BLACK }}
          >
            {isHe ? "או המשך כאורח →" : "Continue as Guest"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FieldWrapper = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
      {label}
    </label>
    {children}
  </div>
);

export default AuthGateway;