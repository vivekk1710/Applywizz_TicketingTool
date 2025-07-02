
"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const EmailVerifyRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
  const verifyToken = async () => {
    // 🔍 1. Read query param
    const query = new URLSearchParams(window.location.search);
    let email = query.get("email") 
      || localStorage.getItem("applywizz_user_email")
      || "";

    // 🔍 2. Read from #fragment manually
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token_hash = hashParams.get("token_hash");
    const type = hashParams.get("type");

    console.log("🎯 Verification parameters:", {
      email,
      token_hash,
      type
    });

    if (!email || !token_hash || type !== "email") {
      console.error("❌ Missing verification parameters");
      navigate("/link-expired");
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token_hash,
        type: "email"
      });

      if (error || !data.user) {
        console.error("❌ OTP verification failed:", error);
        navigate("/link-expired");
        return;
      }

      console.log("✅ OTP verified. Redirecting...");
      navigate(`/EmailConfirmed?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      navigate("/link-expired");
    }
  };

  verifyToken();
}, [navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-blue-600 text-lg font-medium">
        Verifying your email...
      </div>
    </div>
  );
};

export default EmailVerifyRedirect;