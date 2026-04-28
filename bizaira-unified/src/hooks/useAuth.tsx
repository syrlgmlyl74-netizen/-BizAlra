import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeGetItem, safeRemoveItem, safeGetSessionItem, safeRemoveSessionItem, hardResetApp } from "@/lib/safe-storage";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  profile: Profile | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  business_type: string | null;
  target_audience: string | null;
  business_goals: string | null;
  email: string;
  plan: string;
  credits_total: number;
  credits_used: number;
  plan_started_at: string;
  last_renewal_at: string;
  marketing_consent: boolean;
  onboarding_completed: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  profile: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const recoverAuthState = () => {
    console.warn("Recovering auth state due to corrupted session or profile data.");
    hardResetApp();
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.warn("Failed to retrieve user during profile recovery:", userError);
          recoverAuthState();
          return;
        }
        if (user?.user) {
          const onboardingData = safeGetItem("bizaira_onboarding") || safeGetSessionItem("bizaira_onboarding");
          let parsedOnboarding = {};
          if (onboardingData) {
            try {
              parsedOnboarding = JSON.parse(onboardingData);
            } catch (fetchError) {
              console.warn('Invalid onboarding data:', fetchError);
              safeRemoveItem("bizaira_onboarding");
              safeRemoveSessionItem("bizaira_onboarding");
              parsedOnboarding = {};
            }
          }

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              user_id: user.user.id,
              email: user.user.email || "",
              full_name: user.user.user_metadata?.full_name || null,
              ...parsedOnboarding,
              onboarding_completed: true,
            })
            .select()
            .single();

          if (!insertError && newProfile) {
            safeRemoveItem("bizaira_onboarding");
            safeRemoveSessionItem("bizaira_onboarding");
            setProfile(newProfile as Profile);
            return;
          }
          if (insertError) {
            console.warn("Failed to create missing profile:", insertError);
            recoverAuthState();
            return;
          }
        }
      }

      if (data) setProfile(data as Profile);
      else setProfile(null);
    } catch (fetchError) {
      console.warn("Failed to load profile:", fetchError);
      recoverAuthState();
    }
  };

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    } catch (error) {
      console.warn("Failed to load admin role:", error);
      setIsAdmin(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            try {
              await fetchProfile(session.user.id);
              await checkAdmin(session.user.id);
            } catch (error) {
              console.warn("Auth state recovery failed:", error);
              recoverAuthState();
            }
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
          setLoading(false);
        }
      );

      unsubscribe = () => subscription.unsubscribe();
    } catch (subscriptionError) {
      console.warn("Failed to subscribe to auth changes:", subscriptionError);
      recoverAuthState();
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          checkAdmin(session.user.id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.warn("Failed to restore auth session:", error);
        recoverAuthState();
      });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
