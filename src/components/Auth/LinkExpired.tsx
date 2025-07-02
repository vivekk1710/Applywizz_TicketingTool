// ✅ File: src/components/Auth/LinkExpired.tsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const LinkExpired = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem("signup_email") ||
      localStorage.getItem("applywizz_user_email") ||
      "";
    if (storedEmail) {
      setEmail(storedEmail);
      console.log("🪪 Found email:", storedEmail);
    }
  }, []);

  const handleResend = async () => {
    if (!email) return alert("Email not found");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: "https://applywizz-ticketing-tool.vercel.app/EmailConfirmed",
        },
      });
      if (error) throw error;

      alert("✅ Verification link resent");
      setTimeout(() => {
        navigate("/EmailVerifyRedirect?email=" + encodeURIComponent(email));
      }, 2000);
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl text-red-600 font-bold mb-4 text-center">
          Your confirmation link has expired
        </h2>
        <p className="text-gray-600 text-center mb-4">
          No problem. Click the button below to resend.
        </p>
        <input
          type="email"
          className="w-full p-2 mb-4 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          value={email}
          disabled
        />
        <button
          onClick={handleResend}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Sending..." : "Resend Confirmation Email"}
        </button>
      </div>
    </div>
  );
};

export default LinkExpired;
