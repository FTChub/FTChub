import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { authService } from "@/api/firebaseClient";
import { Mail, Lock, LogIn, Chrome } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { setAuthError, setIsAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        await authService.signUpWithEmail(email, password);
      } else {
        await authService.signInWithEmail(email, password);
      }
      // Auth callback will handle navigation
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Try signing up!");
        setIsSignUp(true);
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead!");
        setIsSignUp(false);
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Failed to authenticate. Please try again.");
      }
      setAuthError({
        type: 'login_error',
        message: err.message || "Failed to authenticate"
      });
    } finally {
      setIsLoading(false);
      setAuthError(null);
      setIsAuthenticated(true);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      await authService.signInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <style>{`
        :root {
          --background: 222 47% 11%;
          --foreground: 210 40% 98%;
        }
        body { background: #0f172a; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">FTC</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FTC Hub</h1>
          <p className="text-slate-400">Team Resource Database</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/30 rounded-2xl p-8 shadow-2xl">
          {/* Form Title */}
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            {/* Email Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength="6"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center mb-6 pb-6 border-b border-slate-700/30">
            <p className="text-slate-400 text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-700/30 hover:bg-slate-700/50 disabled:bg-slate-700/20 border border-slate-600/50 hover:border-slate-600 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5" />
            {isLoading ? "Processing..." : "Sign in with Google"}
          </button>

          {/* Footer */}
          <p className="text-slate-500 text-xs text-center mt-6">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
