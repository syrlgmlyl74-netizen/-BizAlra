import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSavedGuestAnswers, createGuestSession } from "@/lib/guest-session";
import { safeSetSessionItem } from "@/lib/safe-storage";

const DEEP_MIDNIGHT_BLUE = "#001F3F";
const PEARL_WHITE = "#F9FAFB";
const INPUT_BG = "#F9F9FB";

const AuthPage = () => {
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
  const [fade, setFade] = useState(true);

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
        navigate("/");
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
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center px-5 py-10"
      dir={isHe ? "rtl" : "ltr"}
      style={{ backgroundColor: PEARL_WHITE, height: "100vh", overflowY: "scroll" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `linear-gradient(135deg, ${DEEP_MIDNIGHT_BLUE} 0%, ${DEEP_MIDNIGHT_BLUE} 100%)`, boxShadow: "0 8px 24px -4px rgba(0, 31, 63, 0.35)" }}
          >
            <Sparkles size={28} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: DEEP_MIDNIGHT_BLUE, fontFamily: "'Assistant', sans-serif", fontWeight: 700 }}>
            {isHe ? "הצטרף היום כדי להתחיל" : "Join Today to Start"}
          </h1>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl p-7 space-y-5 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundColor: "#FFFFFF", boxShadow: "0 8px 40px -8px rgba(13, 35, 68, 0.1)", height: "auto", maxHeight: "none", paddingBottom: "80px" }}
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
                {isHe ? "אני מסכים למדיניות האבטחה..." : "I agree to the security policy..."}
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!isLogin && !agreePolicy)}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: DEEP_MIDNIGHT_BLUE }}
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" />
              : <Sparkles size={18} />}
            {isLogin ? (isHe ? "התחברות" : "Login") : (isHe ? "הרשמה" : "Sign Up")}
          </button>

          {/* Login Toggle */}
          <div className="text-center pt-3">
            <button
              type="button"
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setIsLogin(!isLogin);
                  setFade(true);
                }, 300);
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors underline"
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              {isHe ? "כבר נרשמת? להתחברות" : "Already registered? Login"}
            </button>
          </div>

          {/* Guest Access */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                createGuestSession();
                safeSetSessionItem("onboarding_complete", "true");
                navigate("/");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              {isHe ? "המשך כאורח" : "Continue as guest"}
            </button>
          </div>
        </form>
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

export default AuthPage;
