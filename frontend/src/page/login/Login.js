import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../../config";
import { useUser } from "../../context/UserContext";
import { Button } from "../../component/buttons/button";

// Eye Icons
const EyeOpen = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeClosed = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 3l18 18M10.6 10.6a3 3 0 014.2 4.2m-2.8-7.8C16.8 7 20.5 12 20.5 12s-1 1.9-3.1 3.7M6.2 6.2C3.2 8.3 1.5 12 1.5 12s1.1 2.3 3.7 4.3m5.1.9c.56.18 1.16.27 1.7.27 6.5 0 10.5-7.5 10.5-7.5"></path>
  </svg>
);

// X / Twitter icon
const XIcon = (props) => (
  <svg
    aria-hidden="true"
    className="w-5 h-5"
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
    />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 👁️ NEW: Password Toggle
  const [showPassword, setShowPassword] = useState(false);

  // GOOGLE LOGIN
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const token = response.credential;
      toast.loading("Verifying Google account...");

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      toast.dismiss();

      if (!res.ok) throw new Error(data.message || "Google login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      toast.success("Logged in!", { duration: 2000 });
      navigate("/homepage");
    } catch (e) {
      toast.dismiss();
      toast.error(e.message || "Google login failed");
    }
  }, [navigate, setUser]);

  useEffect(() => {
    const s = document.getElementById("google-oauth");
    if (!s) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-oauth";
      document.body.appendChild(script);
    }

    window.handleGoogleResponse = handleGoogleResponse;
    return () => delete window.handleGoogleResponse;
  }, [handleGoogleResponse]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.google && document.getElementById("google-login-btn")) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          { theme: "outline", size: "medium" }
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handleGoogleResponse]);

  // ---------------------
  // NORMAL LOGIN / SIGNUP
  // ---------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLoginView ? "login" : "register";

    const payload = isLoginView
      ? { email, password }
      : { username, email, password };

    toast
      .promise(
        fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);

          return data;
        }),
        {
          loading: isLoginView ? "Logging in..." : "Creating account...",
          success: (d) => d.message,
          error: (err) => err.message,
        }
      )
      .then(() => setTimeout(() => navigate("/homepage"), 600));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-x-3">
            <img src="/logo.png" className="h-12 w-15" alt="Moofli" />
            <span className="text-3xl font-extrabold text-green-600 font-['Fredoka_One']">
              Moofli
            </span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {isLoginView ? "Welcome Back!" : "Create Your Account"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {!isLoginView && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl"
            />

            {/* >>>>>>> PASSWORD WITH EYE BUTTON <<<<<<< */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5"
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {/* >>>>>>> END <<<<<<< */}

            {/* Forgot Password */}
            {isLoginView && (
              <div className="flex justify-end -mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <Button type="submit" variant="secondary" size="lg" className="w-full">
              {isLoginView ? "Login" : "Sign Up"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-400">OR</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div id="google-login-btn" className="w-full flex justify-center" />
            <Button
              onClick={() => toast.error("X Login not implemented yet")}
              variant="ghost"
              size="lg"
              className="w-full !font-semibold"
            >
              <XIcon /> X
            </Button>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setEmail("");
                setPassword("");
                setUsername("");
              }}
              className="text-sm text-slate-500 hover:text-green-600 font-semibold"
            >
              {isLoginView
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
