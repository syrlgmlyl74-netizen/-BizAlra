import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import OnboardingFlow from "@/components/OnboardingFlow";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import { safeSetSessionItem, safeGetSessionItem } from "@/lib/safe-storage";
import { isGuestSession } from "@/lib/guest-session";

type Step = "onboarding" | "auth" | "home";
export type OnboardingCompleteMode = "guest" | "auth";

const LandingPage = () => {
  const { user, loading } = useAuth();

  const [step, setStep] = useState<Step>("onboarding");

  useEffect(() => {
    if (loading) return;

    const onboardingComplete = safeGetSessionItem("onboarding_complete");
    const hasGuestSession = isGuestSession();

    if (user) {
      setStep("home");
    } else if (hasGuestSession && onboardingComplete) {
      setStep("home");
    } else if (onboardingComplete) {
      setStep("auth");
    } else {
      setStep("onboarding");
    }
  }, [user, loading]);

  const onOnboardingComplete = useCallback((mode: OnboardingCompleteMode) => {
    if (mode === "auth") {
      safeSetSessionItem("onboarding_complete", "true");
    }
    if (mode === "guest") {
      setStep("home");
    } else {
      setStep("auth");
    }
  }, []);

  // If user is loading, show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BizAIra...</p>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (step === "onboarding" && !user) {
    return <OnboardingFlow onComplete={onOnboardingComplete} />;
  }

  // Show auth after onboarding
  if (step === "auth") {
    return <AuthPage />;
  }

  // Show home page for authenticated users or after auth
  if (step === "home") {
    return <HomePage />;
  }

  // Fallback (should not reach here)
  return null;
};

export default LandingPage;
