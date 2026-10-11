import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import {
  Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck, Sparkles, Target, TrendingUp, User
} from "lucide-react";
import { auth, googleProvider } from "./firebase.js";

function friendlyError(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. If you're new here, create an account first.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
    case "auth/unauthorized-domain":
      return "This website address isn't allowed in Firebase yet. In Firebase Console go to Authentication > Settings > Authorized domains and add 127.0.0.1 (and localhost).";
    case "auth/operation-not-allowed":
      return "This sign-in method is turned off. In Firebase Console go to Authentication > Sign-in method and enable it.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.2z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}

export default function Login({ onProfileUpdated }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "reset"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function switchMode(next) {
    setMode(next);
    setError("");
    setInfo("");
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setInfo("");

    const cleanEmail = email.trim();
    if (!cleanEmail) return setError("Please enter your email address.");
    if (mode !== "reset" && !password) return setError("Please enter your password.");
    if (mode === "signup") {
      if (name.trim().length < 2) return setError("Please enter your name.");
      if (password.length < 6) return setError("Your password must be at least 6 characters.");
      if (password !== confirm) return setError("The two passwords don't match.");
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(credential.user, { displayName: name.trim() });
        onProfileUpdated?.();
      } else {
        await sendPasswordResetEmail(auth, cleanEmail);
        setInfo("If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.");
      }
    } catch (err) {
      console.error("Auth error:", err?.code, err?.message);
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google sign-in error:", err?.code, err?.message);
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const titles = {
    signin: ["Welcome back", "Sign in to continue your future planning."],
    signup: ["Create your account", "Start exploring your next chapter in a minute."],
    reset: ["Reset your password", "Enter your email and we'll send you a reset link."]
  };

  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-brand">
          <img className="brand-logo" src="/logo.svg" alt="FutureLife AI logo" />
          <div><strong>FutureLife <span>AI</span></strong><small>YOUR NEXT CHAPTER</small></div>
        </div>

        <div className="auth-hero-copy">
          <h1>Make your next chapter <span>intentional.</span></h1>
          <p>Turn your habits, skills and goals into clear scenarios, risks and a realistic action plan.</p>
          <ul className="auth-points">
            <li><span><TrendingUp size={16} /></span> Compare best-case, likely and difficult futures</li>
            <li><span><Target size={16} /></span> Get a practical 30-day action plan</li>
            <li><span><ShieldCheck size={16} /></span> You control what data you share</li>
          </ul>
        </div>

        <p className="auth-hero-foot">AI-generated guidance is not a promise or professional advice.</p>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <img className="brand-logo" src="/logo.svg" alt="" />
            <strong>FutureLife <span>AI</span></strong>
          </div>

          <div className="eyebrow"><Sparkles size={14} /> {mode === "signup" ? "NEW ACCOUNT" : mode === "reset" ? "ACCOUNT HELP" : "SIGN IN"}</div>
          <h2>{titles[mode][0]}</h2>
          <p className="auth-sub">{titles[mode][1]}</p>

          <form onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <label className="auth-field">
                <span>Full name</span>
                <div className="auth-input">
                  <User size={16} />
                  <input type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <div className="auth-input">
                <Mail size={16} />
                <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </label>

            {mode !== "reset" && (
              <label className="auth-field">
                <span>Password</span>
                <div className="auth-input">
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            )}

            {mode === "signup" && (
              <label className="auth-field">
                <span>Confirm password</span>
                <div className="auth-input">
                  <Lock size={16} />
                  <input type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
              </label>
            )}

            {mode === "signin" && (
              <div className="auth-row">
                <button type="button" className="auth-link" onClick={() => switchMode("reset")}>Forgot password?</button>
              </div>
            )}

            {error && <div className="auth-error" role="alert">{error}</div>}
            {info && <div className="auth-info" role="status">{info}</div>}

            <button type="submit" className="primary-button auth-submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={16} /> : null}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="auth-divider"><span>or</span></div>
              <button type="button" className="outline-button auth-google" onClick={handleGoogle} disabled={busy}>
                <GoogleIcon /> Continue with Google
              </button>
            </>
          )}

          <p className="auth-switch">
            {mode === "signin" && <>New here? <button type="button" className="auth-link" onClick={() => switchMode("signup")}>Create an account</button></>}
            {mode === "signup" && <>Already have an account? <button type="button" className="auth-link" onClick={() => switchMode("signin")}>Sign in</button></>}
            {mode === "reset" && <>Remembered it? <button type="button" className="auth-link" onClick={() => switchMode("signin")}>Back to sign in</button></>}
          </p>
        </div>
      </main>
    </div>
  );
}
