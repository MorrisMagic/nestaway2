import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.msg) {
        // Backend returned a message (error)
        setError(res.data.msg);
      } else {
        // Login successful
        localStorage.setItem("token", res.data.token); // save JWT
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/"); // redirect to home page
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#FF385C] mb-2">NestAway</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Log in</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-[#006C70] hover:text-[#00565A] font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF385C] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#E61E4D] transition-colors duration-200 focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
            >
              Continue
            </button>
          </form>

          {/* Social Login (non-functional for now) */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:border-gray-400 transition-colors duration-200 flex items-center justify-center gap-3"
            >
              {/* Google Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#006C70] font-semibold hover:text-[#00565A] underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center mt-8 text-xs text-gray-500 space-y-2">
          <div className="flex justify-center space-x-4">
            <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms</Link>
            <Link to="/sitemap" className="hover:text-gray-700">Sitemap</Link>
          </div>
          <div>© 2025 NestAway, Inc.</div>
        </div>
      </div>
    </div>
  );
}
