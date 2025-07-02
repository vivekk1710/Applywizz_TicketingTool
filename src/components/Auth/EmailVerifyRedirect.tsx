// ✅ File: src/components/Auth/EmailVerifyRedirect.tsx
"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const EmailVerifyRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = async () => {
      const href = window.location.href;
      const hash = window.location.hash;

      const emailMatch = href.match(/email=([^&#]+)/);
      const email = emailMatch ? decodeURIComponent(emailMatch[1]) : null;

      if (email) {
        localStorage.setItem("applywizz_user_email", email);
        sessionStorage.setItem("signup_email", email);
      }

      // wait 2 seconds before verifying
      await new Promise((res) => setTimeout(res, 2000));

      try {
        const token_hash = new URLSearchParams(window.location.search).get("token_hash");
        const type = new URLSearchParams(window.location.search).get("type");

        if (!email || !token_hash || type !== "email") {
          navigate("/link-expired");
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash,
          email
        });

        if (error || !data.user) {
          navigate("/link-expired");
          return;
        }

        navigate("/emailConfirmed?email=" + encodeURIComponent(email));
      } catch (err) {
        navigate("/link-expired");
      }
    };

    checkVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-blue-600 text-lg font-medium">Verifying your email...</div>
    </div>
  );
};

export default EmailVerifyRedirect;
