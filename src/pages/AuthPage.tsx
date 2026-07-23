import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useNavigate } from "@tanstack/react-router";
import { pullFromCloud } from "@/lib/syncEngine";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useToastStore } from "@/store/useToastStore";
import ReLiftLogo from "@/components/ReLiftLogo";
import { Eye, EyeOff, Globe, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { language, setLanguage } = useSettingsStore();
  const isAr = language === "ar";

  // Display-only styling translations
  const t = {
    titleLogin: isAr ? "أهلاً بك مجدداً يا بطل" : "WELCOME BACK, ATHLETE",
    titleSignup: "START YOUR JOURNEY",
    titleSignupAr: "انضم إلينا يا بطل",
    descLogin: isAr
      ? "سجل الدخول لمزامنة إنجازاتك وقوتك عبر جميع الأجهزة."
      : "Sign in to sync your gains across devices.",
    descSignup: isAr
      ? "أنشئ حساباً سحابياً لحفظ تمارينك وقياساتك للأبد."
      : "Create an account to store workouts in the cloud.",
    descForgot: isAr
      ? "أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور."
      : "Enter your email address and we'll send you a recovery link.",
    titleForgot: isAr ? "إعادة تعيين كلمة المرور" : "RESET PASSWORD",
    btnGoogle: isAr ? "متابعة باستخدام GOOGLE" : "CONTINUE WITH GOOGLE",
    orSeparator: isAr ? "أو" : "OR",
    emailPlaceholder: isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS",
    passwordPlaceholder: isAr ? "كلمة المرور" : "PASSWORD",
    btnSignIn: isAr ? "تسجيل الدخول بالبريد" : "SIGN IN WITH EMAIL",
    btnSignUp: isAr ? "إنشاء الحساب بالبريد" : "SIGN UP WITH EMAIL",
    btnForgot: isAr ? "إرسال رابط استعادة الحساب" : "SEND RESET LINK",
    forgotLink: isAr ? "نسيت كلمة المرور؟" : "Forgot password?",
    noAccount: isAr ? "ليس لديك حساب؟ سجل الآن" : "Don't have an account? Sign up",
    hasAccount: isAr ? "لديك حساب بالفعل؟ سجل الدخول" : "Already have an account? Sign in",
    backToLogin: isAr ? "العودة لتسجيل الدخول" : "Back to sign in",
    termsText: isAr
      ? "باستمرارك في التسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا."
      : "By continuing you agree to our Terms & Privacy Policy",
    errFirebase: isAr ? "قاعدة بيانات ريليفت غير متصلة." : "ReLift services not initialized.",
    errGoogleFail: isAr
      ? "فشل تسجيل الدخول بجوجل في متصفح المعاينة. يرجى تجربة تسجيل الدخول العادي."
      : "Google login failed in review iframe. Please use standard email login.",
    toastResetSuccess: isAr
      ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!"
      : "Password reset link sent to your email!",
    toastWelcome: isAr ? "أهلاً بيك يا بطل! تم المزامنة السحابية بنجاح ⚡" : "Welcome back, Athlete! Cloud sync complete ⚡",
  };

  const handleAuthError = (err: any) => {
    let message = err.message || String(err);
    if (message.includes("auth/user-not-found")) {
      message = isAr ? "البريد الإلكتروني هذا غير مسجل لدينا." : "No user found with this email.";
    } else if (message.includes("auth/wrong-password")) {
      message = isAr ? "كلمة المرور غير صحيحة يا بطل." : "Incorrect password.";
    } else if (message.includes("auth/invalid-email")) {
      message = isAr ? "صيغة البريد الإلكتروني غير صحيحة." : "Invalid email format.";
    } else if (message.includes("auth/email-already-in-use")) {
      message = isAr ? "البريد الإلكتروني مسجل بالفعل." : "Email already in use.";
    } else if (message.includes("auth/weak-password")) {
      message = isAr ? "كلمة المرور ضعيفة للغاية (٦ أحرف على الأقل)." : "Password should be at least 6 characters.";
    }
    setError(message);
    useToastStore.getState().addToast("error", message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!auth) {
      setError(t.errFirebase);
      return;
    }

    setLoading(true);
    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        useToastStore.getState().addToast("success", t.toastResetSuccess);
        setIsForgotPassword(false);
        setIsLogin(true);
      } else {
        const userCredential = isLogin
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

        await pullFromCloud(userCredential.user.uid);
        useToastStore.getState().addToast("success", t.toastWelcome);
        navigate({ to: "/" });
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    if (!auth) {
      setError(t.errFirebase);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await pullFromCloud(userCredential.user.uid);
      useToastStore.getState().addToast("success", t.toastWelcome);
      navigate({ to: "/" });
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(t.errGoogleFail);
      useToastStore.getState().addToast("error", t.errGoogleFail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-bg text-text-primary px-6 py-10 overflow-y-auto select-none font-sans relative">
      {/* Absolute top grid decorative background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.015)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(204,255,0,0.015)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* ── Top Brand Header ── */}
      <div className="flex flex-col items-center text-center mt-6 z-10">
        <ReLiftLogo size={105} className="mb-4" />
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-black italic tracking-widest uppercase text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
            ReLift
          </h1>
          <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/25 px-2.5 py-1 rounded-lg shadow-[0_0_15px_rgba(204,255,0,0.4)] select-none">
            PRO
          </span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted/70 mt-2.5">
          TRACK. LIFT. CONQUER.
        </p>
      </div>

      {/* ── Main Form Card ── */}
      <div className="w-full max-w-md bg-[#0d0d0d]/90 border border-white/5 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_24px_50px_rgba(0,0,0,0.6)] my-8 z-10 flex flex-col gap-6 relative">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Card Header Text */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase text-center">
            {isForgotPassword
              ? t.titleForgot
              : isLogin
                ? t.titleLogin
                : isAr
                  ? t.titleSignupAr
                  : t.titleSignup}
          </h2>
          <p className="text-xs text-text-muted text-center leading-relaxed px-1">
            {isForgotPassword ? t.descForgot : isLogin ? t.descLogin : t.descSignup}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center text-xs text-red-400 font-bold">
            {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isForgotPassword && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-[#bce600] active:scale-[0.98] transition-all duration-200 text-black font-black text-xs uppercase tracking-widest py-4 px-6 rounded-full shadow-[0_4px_20px_rgba(204,255,0,0.25)] hover:shadow-[0_4px_25px_rgba(204,255,0,0.4)] cursor-pointer select-none"
            >
              {/* Google SVG icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.386-2.87-6.386-6.39s2.876-6.388 6.386-6.388c1.637 0 3.123.616 4.274 1.62l3.187-3.187C19.262 2.14 15.98 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.807 0 10.74-4.154 10.74-11.24 0-.648-.063-1.285-.19-1.955H12.24z" />
              </svg>
              <span>{t.btnGoogle}</span>
            </button>
          )}

          {!isForgotPassword && (
            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-muted/50 my-1">
              <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span>{t.orSeparator}</span>
              <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-white/10 to-transparent" />
            </div>
          )}

          {/* Email input */}
          <div className="relative">
            <input
              id="email-input"
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full bg-[#141414]/80 border border-white/5 rounded-full py-4 px-6 text-xs text-white placeholder:text-text-muted/50 focus:outline-none focus:border-primary/80 focus:shadow-[0_0_15px_rgba(204,255,0,0.15)] transition-all duration-200 uppercase tracking-wider font-extrabold",
                isAr ? "text-right" : "text-left"
              )}
              required
              disabled={loading}
            />
          </div>

          {/* Password input */}
          {!isForgotPassword && (
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full bg-[#141414]/80 border border-white/5 rounded-full py-4 px-6 text-xs text-white placeholder:text-text-muted/50 focus:outline-none focus:border-primary/80 focus:shadow-[0_0_15px_rgba(204,255,0,0.15)] transition-all duration-200 tracking-wider font-extrabold",
                  isAr ? "text-right pl-12 pr-6" : "text-left pr-12 pl-6"
                )}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-white transition-colors cursor-pointer",
                  isAr ? "left-5" : "right-5"
                )}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-transparent hover:bg-primary/5 border border-primary text-primary hover:text-primary active:scale-[0.98] transition-all duration-200 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.05)] hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] cursor-pointer mt-2 flex items-center justify-center gap-2 select-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : isForgotPassword ? (
              t.btnForgot
            ) : isLogin ? (
              t.btnSignIn
            ) : (
              t.btnSignUp
            )}
          </button>
        </form>

        {/* Lower Links Menu */}
        <div className="flex flex-col gap-3.5 items-center justify-center mt-1">
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setError("");
              }}
              className="flex items-center gap-2 text-[10px] text-text-muted hover:text-primary transition-colors cursor-pointer font-black uppercase tracking-widest"
            >
              <ArrowLeft size={12} />
              <span>{t.backToLogin}</span>
            </button>
          ) : (
            <>
              {isLogin && (
                <button
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError("");
                  }}
                  className="text-[10px] text-text-muted hover:text-primary transition-colors cursor-pointer font-black uppercase tracking-widest"
                >
                  {t.forgotLink}
                </button>
              )}

              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-[10px] text-primary/80 hover:text-primary transition-colors cursor-pointer font-black uppercase tracking-widest"
              >
                {isLogin ? t.noAccount : t.hasAccount}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Footer Elements ── */}
      <div className="flex flex-col items-center gap-6 mt-4 z-10">
        <p className="text-[9px] text-text-muted/40 text-center max-w-xs leading-relaxed uppercase tracking-wider">
          {t.termsText}
        </p>

        {/* Global Language Switcher Pill */}
        <button
          onClick={() => {
            setLanguage(language === "ar" ? "en" : "ar");
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(12);
            }
          }}
          className="flex items-center gap-2.5 bg-[#0f0f0f] border border-white/5 hover:border-primary/25 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all cursor-pointer active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.5)] select-none"
        >
          <Globe size={13} className="text-primary" />
          <span className={cn(language === "en" ? "text-primary font-black" : "text-text-muted/60")}>EN</span>
          <span className="text-white/10 text-xs">|</span>
          <span className={cn(language === "ar" ? "text-primary font-black" : "text-text-muted/60")}>عربي</span>
        </button>
      </div>
    </div>
  );
}
