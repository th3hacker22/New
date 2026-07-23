import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import AppSkeletonLoader from "./extras/AppSkeletonLoader";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) {
    return <AppSkeletonLoader />;
  }

  // With Guest Mode enabled in useAuthStore, user will be set to a mock object
  // if not authenticated via Firebase. So this check should theoretically pass.
  // However, if we want to STILL show login option but allow skipping, we can.
  // The user said "hide login", so we just show children if user exists (even if guest).
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md space-y-6 p-8"
        >
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Welcome to ReLift</h1>
            <p className="text-text-secondary">
              Please sign in with your Google account to access your fitness data and continue your journey.
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="h-5 w-5"
            />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
