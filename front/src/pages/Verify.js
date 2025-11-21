import { useState } from "react";
import api from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Verify() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const nav = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  // Submit verification
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/verify", { email, code });
      alert(res.data.msg || "Email verified successfully!");
      nav("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const resendCode = async () => {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      const res = await api.post("/auth/resend-code", { email });
      setMessage(res.data.msg || "Verification code resent!");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form className="bg-white p-8 rounded-xl shadow-md w-96" onSubmit={submit}>
        <h1 className="text-2xl font-bold mb-6">Verify Your Email</h1>

        <p className="mb-3 text-gray-600">
          A verification code was sent to:
          <br />
          <b>{email}</b>
        </p>

        {error && <div className="text-red-500 mb-3">{error}</div>}
        {message && <div className="text-green-500 mb-3">{message}</div>}

        <input
          type="text"
          className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/, ""))} // only digits
          maxLength={6}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>

        <button
          type="button"
          onClick={resendCode}
          disabled={isResending}
          className="w-full mt-4 bg-gray-200 text-gray-700 p-3 rounded hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isResending ? "Resending..." : "Resend Code"}
        </button>
      </form>
    </div>
  );
}
