import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import bizairaLogo from "@/assets/bizaira-logo.png";
import { useI18n } from "@/lib/i18n";

const LANG_OPTIONS = [
  { id: "en", label: "English", font: "Assistant, sans-serif" },
  { id: "he", label: "עברית", font: "Heebo, sans-serif" },
] as const;

type LangOption = (typeof LANG_OPTIONS)[number]["id"];

const NAVY = "#001F3F";
const CREAM = "#F9FAFB";
const WHITE = "#FFFFFF";

const OnboardingWelcome = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
  const [selectedLang, setSelectedLang] = useState<LangOption>(lang as LangOption || "en");

  const handleSelect = (option: LangOption) => {
    setSelectedLang(option);
    setLang(option);
  };

  const handleContinue = () => {
    setLang(selectedLang);
    navigate("/onboarding");
  };

  const getText = (key: string) => {
    const translations = {
      "onboarding.welcome.step": { he: "שלב 1 מתוך 4", en: "Step 1 of 4" },
      "onboarding.welcome.title": { he: "איזו שפה אתה מעדיף?", en: "Which language do you prefer?" },
    };
    return translations[key]?.[selectedLang] || key;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }} dir={selectedLang === "he" ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-[32px] border" style={{ borderColor: NAVY, backgroundColor: WHITE, boxShadow: "0 30px 80px -40px rgba(0,31,63,0.22)" }}>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={bizairaLogo} alt="BizAIra" className="h-11 w-auto" />
                <div>
                  <div className="text-xs uppercase tracking-[0.32em] font-semibold" style={{ color: NAVY, fontFamily: "Assistant, sans-serif" }}>
                    {getText("onboarding.welcome.step")}
                  </div>
                  <h1 className="mt-2 text-3xl font-bold" style={{ color: NAVY, fontFamily: "Assistant, sans-serif" }}>
                    {getText("onboarding.welcome.title")}
                  </h1>
                </div>
              </div>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                style={{ borderColor: NAVY, color: NAVY, backgroundColor: WHITE, fontFamily: "Assistant, sans-serif" }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full" style={{ backgroundColor: CREAM }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: "25%", backgroundColor: NAVY }} />
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* English Button */}
              <button
                type="button"
                onClick={() => handleSelect("en")}
                className="flex h-40 flex-col items-center justify-center rounded-[28px] border text-lg font-semibold transition-all duration-300"
                style={{
                  backgroundColor: selectedLang === "en" ? NAVY : WHITE,
                  color: selectedLang === "en" ? WHITE : NAVY,
                  borderColor: NAVY,
                  fontFamily: "Assistant, sans-serif",
                  boxShadow: selectedLang === "en" ? "0 20px 60px -40px rgba(0,31,63,0.45)" : "0 10px 30px -25px rgba(0,31,63,0.18)",
                }}
              >
                English
              </button>

              {/* Hebrew Button */}
              <button
                type="button"
                onClick={() => handleSelect("he")}
                className="flex h-40 flex-col items-center justify-center rounded-[28px] border text-lg font-semibold transition-all duration-300"
                style={{
                  backgroundColor: selectedLang === "he" ? NAVY : WHITE,
                  color: selectedLang === "he" ? WHITE : NAVY,
                  borderColor: NAVY,
                  fontFamily: "Heebo, sans-serif",
                  boxShadow: selectedLang === "he" ? "0 20px 60px -40px rgba(0,31,63,0.45)" : "0 10px 30px -25px rgba(0,31,63,0.18)",
                }}
              >
                עברית
              </button>
            </div>

            <div className="mt-8 rounded-[28px] border p-5" style={{ borderColor: NAVY, backgroundColor: CREAM }}>
              <p className="text-sm leading-7" style={{ color: NAVY, fontFamily: "Assistant, sans-serif" }}>
                {selectedLang === "he"
                  ? "בחר/י עברית עבור ממשק RTL ויישום מלא בעברית, כאשר BizAIra ו-AI נשארים באנגלית."
                  : "Choose English for the app interface, with BizAIra and AI always kept in English."}
              </p>
            </div>
          </div>

          <div className="border-t px-6 py-6" style={{ borderColor: NAVY }}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm font-medium" style={{ color: NAVY, fontFamily: "Assistant, sans-serif" }}>
                {selectedLang === "he" ? "שפה נבחרה:" : "Selected language:"}{" "}
                <span className="font-semibold">{selectedLang === "he" ? "עברית" : "English"}</span>
              </div>
              <button
                onClick={handleContinue}
                disabled={!selectedLang}
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold transition"
                style={{
                  backgroundColor: NAVY,
                  color: WHITE,
                  fontFamily: "Assistant, sans-serif",
                  opacity: selectedLang ? 1 : 0.5,
                  cursor: selectedLang ? "pointer" : "not-allowed",
                }}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
