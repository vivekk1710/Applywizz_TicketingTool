"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import DialogBox from "./DialogBox"; // ✅ You already have this

const EmailVerifyRedirect = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const query = new URLSearchParams(window.location.search);
      let email = query.get("email") 
        || localStorage.getItem("applywizz_user_email")
        || "";

      // 🔥 FIX: Supabase appends token in `#fragment`, not search param
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token_hash = hashParams.get("token_hash");
      const type = hashParams.get("type");

      console.log("🔍 Token Params:", { email, token_hash, type });

      if (!email || !token_hash || type !== "email") {
        setToast({ type: "error", message: "Missing or invalid verification link." });
        setTimeout(() => navigate("/link-expired"), 2000);
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token_hash,
          type: "email"
        });

        if (error || !data.user) {
          console.error("❌ Verification failed:", error?.message);
          setToast({ type: "error", message: "Verification failed or expired." });
          setTimeout(() => navigate("/link-expired"), 2500);
          return;
        }

        // ✅ Success
        setToast({ type: "success", message: "Email verified successfully!" });
        localStorage.setItem("applywizz_user_email", email);
        sessionStorage.setItem("signup_email", email);

        setTimeout(() => {
          navigate(`/EmailConfirmed?email=${encodeURIComponent(email)}`);
        }, 2000);

      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setToast({ type: "error", message: "Unexpected error verifying email." });
        setTimeout(() => navigate("/link-expired"), 2000);
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-blue-600 text-lg font-medium">Verifying your email...</div>
      {toast && (
        <DialogBox
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EmailVerifyRedirect;
