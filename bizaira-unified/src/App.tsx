import { Component, useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import CookieConsentPopup from "@/components/CookieConsentPopup";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { CookieConsent, getCookieConsent, loadTrackingScripts, setCookieConsent } from "@/lib/cookie-consent";
import { hardResetApp } from "@/lib/safe-storage";
import LandingPage from "./pages/LandingPage";
import CreatePage from "./pages/CreatePage";
import JournalPage from "./pages/JournalPage";
import ProductPhotoStudioPage from "./pages/ProductPhotoStudioPage";
import AIMessagesPage from "./pages/AIMessagesPage";
import BusinessAnalyticsPage from "./pages/BusinessAnalyticsPage";
import TimeOptimizerPage from "./pages/TimeOptimizerPage";
import PricingStrategistPage from "./pages/PricingStrategistPage";
import ImageStudioPage from "./pages/ImageStudioPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import SupportPage from "./pages/SupportPage";
import VideoStudioPage from "./pages/VideoStudioPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import NotFound from "./pages/NotFound";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminComponentsPage from "./pages/admin/AdminComponentsPage";
import AdminAIPage from "./pages/admin/AdminAIPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("App error boundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#000B18] p-10" dir="ltr">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E5E8EB] bg-[#FAF9FC] p-10 shadow-[0_24px_64px_rgba(0,11,24,0.1)]">
            <p className="text-sm uppercase tracking-[0.3em] text-[#64748B]">Unexpected error</p>
            <h1 className="mt-4 text-3xl font-semibold text-[#000B18]">Something went wrong</h1>
            <p className="mt-3 text-base leading-7 text-[#475569]">
              The app encountered an unexpected issue. Please refresh the page or contact support if this continues.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-3xl bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001830]"
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setShowConsent(true);
    } else {
      loadTrackingScripts(consent).catch((error) => {
        console.warn("Tracking scripts did not load:", error);
      });
    }

    const recover = (event: Event | PromiseRejectionEvent) => {
      console.error("Global app error detected, forcing recovery:", event);
      hardResetApp();
    };

    window.addEventListener("error", recover);
    window.addEventListener("unhandledrejection", recover);

    return () => {
      window.removeEventListener("error", recover);
      window.removeEventListener("unhandledrejection", recover);
    };
  }, []);

  const handleConsent = (consent: CookieConsent) => {
    setShowConsent(false);
    setCookieConsent(consent);
    loadTrackingScripts(consent).catch((error) => console.warn("Tracking scripts failed to load:", error));
  };

  return (
    <GoogleOAuthProvider clientId="1023943507073-o7fjk67sribqj66qmli7rj63q69hbvsg.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <I18nProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <AppErrorBoundary>
                <BrowserRouter>
                  <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/onboarding-welcome" element={<OnboardingWelcome />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />

                  <Route path="/admin/pages" element={<AdminLayout><AdminPagesPage /></AdminLayout>} />
                  <Route path="/admin/media" element={<AdminLayout><AdminMediaPage /></AdminLayout>} />
                  <Route path="/admin/components" element={<AdminLayout><AdminComponentsPage /></AdminLayout>} />
                  <Route path="/admin/ai" element={<AdminLayout><AdminAIPage /></AdminLayout>} />
                  <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
                  <Route path="/admin/settings" element={<AdminLayout><AdminSettingsPage /></AdminLayout>} />

                  <Route path="/" element={<LandingPage />} />
                  <Route path="/create" element={<AppLayout><CreatePage /></AppLayout>} />
                  <Route path="/journal" element={<AppLayout><JournalPage /></AppLayout>} />
                  <Route path="/create/product-photos" element={<AppLayout><ProductPhotoStudioPage /></AppLayout>} />
                  <Route path="/create/messages" element={<AppLayout><AIMessagesPage /></AppLayout>} />
                  <Route path="/create/analytics" element={<AppLayout><BusinessAnalyticsPage /></AppLayout>} />
                  <Route path="/create/time" element={<AppLayout><TimeOptimizerPage /></AppLayout>} />
                  <Route path="/create/pricing" element={<AppLayout><PricingStrategistPage /></AppLayout>} />
                  <Route path="/create/image-studio" element={<AppLayout><ImageStudioPage /></AppLayout>} />
                  <Route path="/create/video" element={<AppLayout><VideoStudioPage /></AppLayout>} />
                  <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
                  <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><AccountSettingsPage /></AppLayout>} />
                  <Route path="/pricing" element={<AppLayout><PricingPage /></AppLayout>} />
                  <Route path="/support" element={<AppLayout><SupportPage /></AppLayout>} />
                  <Route path="/accessibility" element={<AppLayout><AccessibilityStatement /></AppLayout>} />
                  <Route path="/privacy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
                  <Route path="/terms" element={<AppLayout><TermsOfUse /></AppLayout>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                {showConsent && <CookieConsentPopup onConsent={handleConsent} />}
              </BrowserRouter>
            </AppErrorBoundary>
            </AuthProvider>
          </I18nProvider>
        </TooltipProvider>
        <AccessibilityWidget />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
