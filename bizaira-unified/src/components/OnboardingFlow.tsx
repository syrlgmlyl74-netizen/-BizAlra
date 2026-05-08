import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { createGuestSession, updateGuestSession, saveGuestOnboardingAnswers } from "@/lib/guest-session";
import { safeSetSessionItem } from "@/lib/safe-storage";
import AuthGateway from "@/components/AuthGateway";
import {
  ArrowLeft, Check,
  ShoppingBag, Utensils, Star, Home, Monitor, Briefcase,
  Heart, GraduationCap, MoreHorizontal,
  Users, Baby, User, UserCheck, Building, PartyPopper, Globe,
  TrendingUp, Megaphone, Share2, Award, Clock, UserPlus,
} from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (mode: "guest" | "auth") => void;
}

type Step = "greeting" | "language" | "business" | "business-info" | "audience" | "audience-info" | "goal" | "guest-auth-choice";

type LangOption = {
  label: string;
  value: "en" | "he";
};

const NAVY = "#001A33";
const BLACK = "#000000";
const WHITE = "#FFFFFF";
const LIGHT_GRAY = "#E8E8E8";
const MID_GRAY = "#999999";
const BG_LIGHT = "#F5F5F5";

const languageOptions: LangOption[] = [
  { label: "English", value: "en" },
  { label: "עברית", value: "he" },
];

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { lang, setLang, t } = useI18n();
  const isHe = lang === "he";

  const [step, setStep] = useState<Step>("greeting");
  const [selectedLanguage, setSelectedLanguage] = useState<LangOption | null>(
    languageOptions.find((option) => option.value === lang) ?? null
  );
  const [businessType, setBusinessType] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");

  const businessTypes = [
    { label: t("onboarding.business.fashion"), Icon: ShoppingBag },
    { label: t("onboarding.business.food"), Icon: Utensils },
    { label: t("onboarding.business.beauty"), Icon: Star },
    { label: t("onboarding.business.realEstate"), Icon: Home },
    { label: t("onboarding.business.digital"), Icon: Monitor },
    { label: t("onboarding.business.services"), Icon: Briefcase },
    { label: t("onboarding.business.health"), Icon: Heart },
    { label: t("onboarding.business.education"), Icon: GraduationCap },
    { label: t("onboarding.business.other"), Icon: MoreHorizontal },
  ];

  const audiences = [
    { label: t("onboarding.audience.teens"), Icon: Baby },
    { label: t("onboarding.audience.adults"), Icon: User },
    { label: t("onboarding.audience.women"), Icon: Users },
    { label: t("onboarding.audience.men"), Icon: UserCheck },
    { label: t("onboarding.audience.businesses"), Icon: Building },
    { label: t("onboarding.audience.parents"), Icon: PartyPopper },
    { label: t("onboarding.audience.general"), Icon: Globe },
  ];

  const goals = [
    { label: t("onboarding.goal.sales"), Icon: TrendingUp },
    { label: t("onboarding.goal.exposure"), Icon: Megaphone },
    { label: t("onboarding.goal.social"), Icon: Share2 },
    { label: t("onboarding.goal.branding"), Icon: Award },
    { label: t("onboarding.goal.time"), Icon: Clock },
    { label: t("onboarding.goal.clients"), Icon: UserPlus },
  ];

  const handleLanguageSelect = (option: LangOption) => {
    setSelectedLanguage(option);
    setLang(option.value);
  };

  useEffect(() => {
    const currentSelection = languageOptions.find((option) => option.value === lang) ?? null;
    if (currentSelection?.value !== selectedLanguage?.value) {
      setSelectedLanguage(currentSelection);
    }
  }, [lang, selectedLanguage]);

  const getStepNumber = (): number => {
    switch (step) {
      case "language": return 1;
      case "business": case "business-info": return 2;
      case "audience": case "audience-info": return 3;
      case "goal": return 4;
      default: return 0;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      style={{
        backgroundColor: BG_LIGHT,
        backgroundImage: "radial-gradient(circle at top right, rgba(0,0,0,0.02) 1px, transparent 1px), radial-gradient(circle at bottom left, rgba(0,0,0,0.02) 1px, transparent 1px)",
        backgroundSize: "72px 72px, 96px 96px",
      }}
      dir="ltr"
    >
      <div className="w-full max-w-2xl" style={{
        borderRadius: "24px",
        border: "none",
        backgroundColor: WHITE,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        backdropFilter: "none",
        padding: "48px 40px",
      }}>

        {/* ─── Screen 1: Greeting ─── */}
        {step === "greeting" && (
          <div className="text-center animate-fade-in" dir="ltr">
            <h1 className="mb-4" style={{ color: NAVY, fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.5px' }}>
              {t("onboarding.greeting.title")}
            </h1>
            <p className="mb-12 max-w-md mx-auto" style={{ color: MID_GRAY, fontFamily: "'Montserrat', sans-serif", fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 }}>
              {t("onboarding.greeting.subtitle")}
            </p>

            <button
              onClick={() => {
                setLang("en");
                setStep("language");
              }}
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: "12px",
                backgroundColor: NAVY,
                color: WHITE,
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: "'Montserrat', sans-serif",
                letterSpacing: "0.01em",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#001425";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 26, 51, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = NAVY;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {t("onboarding.greeting.button")}
            </button>
          </div>
        )}

        {/* ─── Screen 2: Language Selection ─── */}
        {step === "language" && (
          <div className="animate-fade-in">
            <StepHeader num={1} total={4} title="Which language do you prefer?" isHe={isHe} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
              {languageOptions.map((option) => {
                const selected = selectedLanguage?.value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleLanguageSelect(option)}
                    style={{
                      minHeight: "120px",
                      padding: "24px",
                      borderRadius: "12px",
                      backgroundColor: selected ? NAVY : "hsl(0 0% 100%)",
                      border: `2px solid ${selected ? NAVY : LIGHT_GRAY}`,
                      color: selected ? WHITE : NAVY,
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-assistant)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: selected ? `0 8px 24px -8px ${NAVY}` : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = NAVY;
                        e.currentTarget.style.backgroundColor = "hsl(220 25% 97%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = LIGHT_GRAY;
                        e.currentTarget.style.backgroundColor = "hsl(0 0% 100%)";
                      }
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep("greeting")}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  border: `2px solid ${LIGHT_GRAY}`,
                  backgroundColor: "hsl(0 0% 100%)",
                  color: NAVY,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={20} style={{ transform: isHe ? "scaleX(-1)" : "none" }} />
              </button>
              <button
                onClick={() => selectedLanguage && setStep("business")}
                disabled={!selectedLanguage}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: selectedLanguage ? NAVY : MID_GRAY,
                  color: WHITE,
                  fontSize: "1rem",
                  fontWeight: 600,
                  fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                  border: "none",
                  cursor: selectedLanguage ? "pointer" : "not-allowed",
                  boxShadow: selectedLanguage ? `0 8px 20px -8px ${NAVY}` : "none",
                  transition: "all 0.3s ease",
                  opacity: selectedLanguage ? 1 : 0.6,
                }}
              >
                {t("onboarding.continue")}
              </button>
            </div>
          </div>
        )}

        {/* ─── Screen 3: Business Type ─── */}
        {step === "business" && (
          <div className="animate-fade-in">
            <StepHeader num={2} total={4} title={t("onboarding.business.title")} isHe={isHe} />
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
              {businessTypes.map(({ label, Icon }) => {
                const selected = businessType === label;
                return (
                  <button
                    key={label}
                    onClick={() => setBusinessType(label)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                      padding: "20px 16px",
                      borderRadius: "12px",
                      backgroundColor: selected ? NAVY : "hsl(0 0% 100%)",
                      border: `2px solid ${selected ? NAVY : LIGHT_GRAY}`,
                      color: selected ? WHITE : NAVY,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: selected ? `0 6px 16px -6px ${NAVY}` : "none",
                      transform: selected ? "scale(1.03)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = NAVY;
                        e.currentTarget.style.backgroundColor = "hsl(220 25% 97%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = LIGHT_GRAY;
                        e.currentTarget.style.backgroundColor = "hsl(0 0% 100%)";
                      }
                    }}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                    <span style={{ textAlign: "center", lineHeight: "1.3" }}>{label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep("language")}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  border: `2px solid ${LIGHT_GRAY}`,
                  backgroundColor: "hsl(0 0% 100%)",
                  color: NAVY,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={20} style={{ transform: isHe ? "scaleX(-1)" : "none" }} />
              </button>
              <button
                onClick={() => businessType && setStep("business-info")}
                disabled={!businessType}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: businessType ? NAVY : MID_GRAY,
                  color: WHITE,
                  fontSize: "1rem",
                  fontWeight: 600,
                  fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                  border: "none",
                  cursor: businessType ? "pointer" : "not-allowed",
                  boxShadow: businessType ? `0 8px 20px -8px ${NAVY}` : "none",
                  transition: "all 0.3s ease",
                  opacity: businessType ? 1 : 0.6,
                }}
              >
                {t("onboarding.continue")}
              </button>
            </div>
          </div>
        )}

        {/* ─── Screen 3b: Business Info Confirmation ─── */}
        {step === "business-info" && (
          <div className="animate-fade-in text-center">
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: `hsla(222 47% 8% / 0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <Check size={32} style={{ color: NAVY, strokeWidth: 3 }} />
            </div>
            <h2 className={`hebrew-heading-2 ${isHe ? 'hebrew-heading-2' : ''} mb-4`} style={{ color: NAVY, fontFamily: isHe ? "var(--font-heebo)" : "var(--font-playfair)" }}>
              {t("onboarding.businessInfo.perfect")}
            </h2>
            <p className={`hebrew-body ${isHe ? 'hebrew-body' : ''} mb-12 max-w-md mx-auto`} style={{ color: MID_GRAY }}>
              {t("onboarding.businessInfo.confirmationDescription").replace("{{businessType}}", businessType)}
            </p>
            <button
              onClick={() => setStep("audience")}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: "10px",
                border: `2px solid ${NAVY}`,
                backgroundColor: "hsl(0 0% 100%)",
                color: NAVY,
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = NAVY;
                e.currentTarget.style.color = WHITE;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(0 0% 100%)";
                e.currentTarget.style.color = NAVY;
              }}
            >
              {t("onboarding.businessInfo.next")}
            </button>
          </div>
        )}

        {/* ─── Screen 4: Audience ─── */}
        {step === "audience" && (
          <div className="animate-fade-in">
            <StepHeader num={3} total={4} title={t("onboarding.audience.title")} isHe={isHe} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              {audiences.map(({ label, Icon }) => {
                const selected = audience === label;
                return (
                  <button
                    key={label}
                    onClick={() => setAudience(label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px",
                      borderRadius: "10px",
                      backgroundColor: selected ? NAVY : "hsl(0 0% 100%)",
                      border: `2px solid ${selected ? NAVY : LIGHT_GRAY}`,
                      color: selected ? WHITE : NAVY,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: selected ? `0 6px 16px -6px ${NAVY}` : "none",
                      textAlign: isHe ? "right" : "left",
                      justifyContent: isHe ? "flex-end" : "flex-start",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = NAVY;
                        e.currentTarget.style.backgroundColor = "hsl(220 25% 97%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = LIGHT_GRAY;
                        e.currentTarget.style.backgroundColor = "hsl(0 0% 100%)";
                      }
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep("business")}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  border: `2px solid ${LIGHT_GRAY}`,
                  backgroundColor: "hsl(0 0% 100%)",
                  color: NAVY,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={20} style={{ transform: isHe ? "scaleX(-1)" : "none" }} />
              </button>
              <button
                onClick={() => audience && setStep("audience-info")}
                disabled={!audience}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: audience ? NAVY : MID_GRAY,
                  color: WHITE,
                  fontSize: "1rem",
                  fontWeight: 600,
                  fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                  border: "none",
                  cursor: audience ? "pointer" : "not-allowed",
                  boxShadow: audience ? `0 8px 20px -8px ${NAVY}` : "none",
                  transition: "all 0.3s ease",
                  opacity: audience ? 1 : 0.6,
                }}
              >
                {t("onboarding.continue")}
              </button>
            </div>
          </div>
        )}

        {/* ─── Screen 4b: Audience Info Confirmation ─── */}
        {step === "audience-info" && (
          <div className="animate-fade-in text-center">
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: `hsla(222 47% 8% / 0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <Check size={32} style={{ color: NAVY, strokeWidth: 3 }} />
            </div>
            <h2 className={`hebrew-heading-2 ${isHe ? 'hebrew-heading-2' : ''} mb-4`} style={{ color: NAVY, fontFamily: isHe ? "var(--font-heebo)" : "var(--font-playfair)" }}>
              {t("onboarding.audienceInfo.excellent")}
            </h2>
            <p className={`hebrew-body ${isHe ? 'hebrew-body' : ''} mb-12 max-w-md mx-auto`} style={{ color: MID_GRAY }}>
              {t("onboarding.audienceInfo.description").replace("{{audience}}", audience)}
            </p>
            <button
              onClick={() => setStep("goal")}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: "10px",
                border: `2px solid ${NAVY}`,
                backgroundColor: "hsl(0 0% 100%)",
                color: NAVY,
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = NAVY;
                e.currentTarget.style.color = WHITE;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(0 0% 100%)";
                e.currentTarget.style.color = NAVY;
              }}
            >
              {t("onboarding.audienceInfo.last")}
            </button>
          </div>
        )}

        {/* ─── Screen 5: Goal ─── */}
        {step === "goal" && (
          <div className="animate-fade-in">
            <StepHeader num={4} total={4} title={t("onboarding.goal.title")} isHe={isHe} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              {goals.map(({ label, Icon }) => {
                const selected = goal === label;
                return (
                  <button
                    key={label}
                    onClick={() => setGoal(label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px",
                      borderRadius: "10px",
                      backgroundColor: selected ? NAVY : "hsl(0 0% 100%)",
                      border: `2px solid ${selected ? NAVY : LIGHT_GRAY}`,
                      color: selected ? WHITE : NAVY,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: selected ? `0 6px 16px -6px ${NAVY}` : "none",
                      textAlign: isHe ? "right" : "left",
                      justifyContent: isHe ? "flex-end" : "flex-start",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = NAVY;
                        e.currentTarget.style.backgroundColor = "hsl(220 25% 97%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = LIGHT_GRAY;
                        e.currentTarget.style.backgroundColor = "hsl(0 0% 100%)";
                      }
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep("audience")}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  border: `2px solid ${LIGHT_GRAY}`,
                  backgroundColor: "hsl(0 0% 100%)",
                  color: NAVY,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={20} style={{ transform: isHe ? "scaleX(-1)" : "none" }} />
              </button>
              <button
                onClick={() => goal && setStep("guest-auth-choice")}
                disabled={!goal}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: goal ? NAVY : MID_GRAY,
                  color: WHITE,
                  fontSize: "1rem",
                  fontWeight: 600,
                  fontFamily: isHe ? "var(--font-assistant)" : "var(--font-montserrat)",
                  border: "none",
                  cursor: goal ? "pointer" : "not-allowed",
                  boxShadow: goal ? `0 8px 20px -8px ${NAVY}` : "none",
                  transition: "all 0.3s ease",
                  opacity: goal ? 1 : 0.6,
                }}
              >
                {isHe ? "סיים" : "Finish"}
              </button>
            </div>
          </div>
        )}

        {/* ─── Screen 6: Auth Gateway ─── */}
        {step === "guest-auth-choice" && (
          <AuthGateway
            onComplete={(mode) => {
              const onboardingData = {
                business_type: businessType,
                target_audience: audience,
                business_goals: goal,
              };
              saveGuestOnboardingAnswers(onboardingData);
              if (mode === "auth") {
                safeSetSessionItem("onboarding_complete", "true");
              }
              onComplete(mode);
            }}
            onboardingData={{
              business_type: businessType,
              target_audience: audience,
              business_goals: goal,
            }}
          />
        )}
      </div>
    </div>
  );
};

const StepHeader = ({ num, total, title, isHe }: { num: number; total: number; title: string; isHe?: boolean }) => (
  <div style={{ marginBottom: "32px" }}>
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "2px",
            backgroundColor: i < num ? NAVY : LIGHT_GRAY,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
    <p style={{
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.05em",
      color: MID_GRAY,
      textTransform: "uppercase",
      marginBottom: "8px",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      Step {num} of {total}
    </p>
    <h2 style={{
      fontSize: "1.5rem",
      fontWeight: 600,
      color: NAVY,
      fontFamily: isHe ? "var(--font-heebo)" : "var(--font-playfair)",
      margin: 0,
    }}>
      {title}
    </h2>
  </div>
);

export default OnboardingFlow;
