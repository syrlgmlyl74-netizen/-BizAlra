import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import OnboardingFlow from "@/components/OnboardingFlow";
import AuthSection from "@/components/AuthSection";

type Step = "onboarding" | "main";

const LandingPage = () => {
  const { lang } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("onboarding");

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const onOnboardingComplete = useCallback(() => {
    setStep("main");
  }, []);

  const handleGuestContinue = () => {
    navigate("/create");
  };

  if (step === "onboarding" && !user) {
    return <OnboardingFlow onComplete={onOnboardingComplete} />;
  }

  // For guests who completed onboarding, allow access to create
  if (!user && step === "main") {
    navigate("/create");
    return null;
  }

  // This should not be reached for authenticated users due to redirect
  return null;
};

export default LandingPage;
