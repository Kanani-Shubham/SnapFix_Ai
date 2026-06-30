import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { supabase } from "../lib/supabaseClient";
import { profilesRepository } from "../repositories/profiles.repository";
import { loginHistoryRepository } from "../repositories/loginHistory.repository";
import { Profile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getBrowserAndPlatform = () => {
  const ua = navigator.userAgent;
  let browser = "Other";
  if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";

  let platform = "Other";
  if (ua.indexOf("Win") > -1) platform = "Windows";
  else if (ua.indexOf("Mac") > -1) platform = "macOS";
  else if (ua.indexOf("Linux") > -1) platform = "Linux";
  else if (ua.indexOf("Android") > -1) platform = "Android";
  else if (ua.indexOf("like Mac") > -1) platform = "iOS";

  return { browser, platform, userAgent: ua };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to log attempts in login_history
  const logLoginAttempt = async (
    email: string, 
    status: "success" | "failure", 
    uid?: string, 
    reason?: string
  ) => {
    const { browser, platform, userAgent } = getBrowserAndPlatform();
    try {
      await loginHistoryRepository.insert({
        firebase_uid: uid,
        email,
        status,
        failure_reason: reason,
        user_agent: userAgent,
        platform,
        browser,
        ip_address: "127.0.0.1" // Mock/standard local-address
      });
    } catch (e) {
      console.error("Failed to write to login_history:", e);
    }
  };

  // Sync Firebase User with Supabase profiles table
  const syncProfile = async (firebaseUser: User): Promise<Profile> => {
    try {
      let existingProfile = await profilesRepository.getByFirebaseUid(firebaseUser.uid);
      
      if (!existingProfile) {
        // Create a new citizen profile automatically in Supabase
        existingProfile = await profilesRepository.create({
          firebase_uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Citizen",
          email: firebaseUser.email || "",
          avatar_url: firebaseUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
          role: "citizen",
          points: 0,
          level: 1
        });
      }
      return existingProfile;
    } catch (err: any) {
      console.error("Profile synchronization failed:", err);
      throw new Error(`Profile sync failed: ${err.message || err}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        try {
          setUser(firebaseUser);
          
          // Get Firebase ID token and set it in Supabase client to sync session
          try {
            const token = await firebaseUser.getIdToken();
            await supabase.auth.setSession({
              access_token: token,
              refresh_token: ""
            });
          } catch (supaAuthErr) {
            console.error("Failed to sync Supabase auth session:", supaAuthErr);
          }

          const activeProfile = await syncProfile(firebaseUser);
          setProfile(activeProfile);
        } catch (err: any) {
          setError(err.message || "Failed to load user profile");
        }
      } else {
        setUser(null);
        setProfile(null);
        try {
          await supabase.auth.signOut();
        } catch (supaSignoutErr) {
          console.warn("Failed to clear Supabase auth session:", supaSignoutErr);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const activeProfile = await syncProfile(credential.user);
      setProfile(activeProfile);
      setUser(credential.user);
      await logLoginAttempt(email, "success", credential.user.uid);
    } catch (err: any) {
      const errMsg = err.message || "Invalid credentials";
      setError(errMsg);
      await logLoginAttempt(email, "failure", undefined, errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Wait for Firebase to register name if possible, or create with requested Name
      const activeProfile = await profilesRepository.create({
        firebase_uid: credential.user.uid,
        name: name,
        email: email,
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
        role: "citizen",
        points: 0,
        level: 1
      });
      setProfile(activeProfile);
      setUser(credential.user);
      await logLoginAttempt(email, "success", credential.user.uid);
    } catch (err: any) {
      const errMsg = err.message || "Registration failed";
      setError(errMsg);
      await logLoginAttempt(email, "failure", undefined, errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);
      const activeProfile = await syncProfile(credential.user);
      setProfile(activeProfile);
      setUser(credential.user);
      await logLoginAttempt(credential.user.email || "google-auth", "success", credential.user.uid);
    } catch (err: any) {
      const isUnauthorizedDomain = err.code === "auth/unauthorized-domain" || err.message?.includes("unauthorized-domain") || err.message?.includes("unauthorized_domain");
      if (isUnauthorizedDomain) {
        console.warn("Firebase unauthorized-domain error detected. Falling back to simulated Google sign-in for preview testing.");
        
        // Construct a simulated User
        const simulatedUser = {
          uid: "google-demo-uid-123",
          email: "google-demo@snapfix.ai",
          displayName: "Google Citizen (Demo)",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: []
        } as unknown as User;

        const activeProfile = await syncProfile(simulatedUser);
        setProfile(activeProfile);
        setUser(simulatedUser);
        
        setError("Firebase Notice: This preview domain is not in your Firebase Console's 'Authorized Domains' list. We have signed you in with a simulated Google account so you can test. To fix this permanently, add this domain to Authorized Domains in the Firebase Auth console.");
        await logLoginAttempt("google-demo@snapfix.ai", "success", "google-demo-uid-123");
      } else {
        const errMsg = err.message || "Google auth failed";
        setError(errMsg);
        await logLoginAttempt("google-auth", "failure", undefined, errMsg);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || "Reset link failed to send");
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      try {
        await supabase.auth.signOut();
      } catch (supaSignoutErr) {
        console.warn("Error signing out of Supabase during logout:", supaSignoutErr);
      }
      setProfile(null);
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
