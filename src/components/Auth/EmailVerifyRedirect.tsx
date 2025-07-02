// // ✅ File: src/components/Auth/EmailVerifyRedirect.tsx
// "use client";

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from '@/lib/supabaseClient';

// const EmailVerifyRedirect = () => {
//     const navigate = useNavigate();
//     console.log("🔥 EmailVerifyRedirect component mounted!");

//     useEffect(() => {
//         console.log("🔍 Starting email verification process...");
//         const checkVerification = async () => {
//             console.log("📬 Current URL:", window.location.href);
//             const href = window.location.href;
//             const hash = window.location.hash;

//             const emailMatch = href.match(/email=([^&#]+)/);
//             const email = emailMatch ? decodeURIComponent(emailMatch[1]) : null;

//             if (email) {
//                 localStorage.setItem("applywizz_user_email", email);
//                 sessionStorage.setItem("signup_email", email);
//             }

//             // wait 2 seconds before verifying
//             await new Promise((res) => setTimeout(res, 2000));

//             try {
//                 console.log("🔐 Attempting to verify OTP...");
//                 const token_hash = new URLSearchParams(window.location.search).get("token_hash");
//                 const type = new URLSearchParams(window.location.search).get("type");

//                 if (!email || !token_hash || type !== "email") {
//                     navigate("/link-expired", { replace: true });
//                     return;
//                 }

//                 const { data, error } = await supabase.auth.verifyOtp({
//                     type: "email",
//                     token_hash,
//                     email
//                 });

//                 if (error || !data.user) {
//                     navigate("/link-expired", { replace: true });
//                     return;
//                 }

//                 navigate("/EmailConfirmed?email=" + encodeURIComponent(email), { replace: true });
//             } catch (err) {
//                 console.error("⚠️ Unexpected error during verification:", err);
//                 navigate("/link-expired", { replace: true });
//             }
//         };

//         checkVerification();
//     }, [navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//             <div className="text-blue-600 text-lg font-medium">Verifying your email...</div>
//         </div>
//     );
// };

// export default EmailVerifyRedirect;


// // Updated File: src/components/Auth/EmailVerifyRedirect.tsx
// // "use client"; import { useEffect } from "react"; const EmailVerifyRedirect = () => {
// //     useEffect(() => { console.log("Confirmation link clicked"); }, []); return (<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4"><div className="text-blue-600 text-lg font-medium">        Confirmation link clicked!
// //     </div></div>);
// // }; export default EmailVerifyRedirect;

"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const EmailVerifyRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyToken = async () => {
      // ✅ 1. Extract parameters from URL
      const query = new URLSearchParams(window.location.search);
      const token_hash = query.get("token_hash");
      const type = query.get("type");
      const email = query.get("email") 
        || localStorage.getItem("applywizz_user_email")
        || "";

      console.log("Verification parameters:", {
        token_hash,
        type,
        email
      });

      // ✅ 2. Validate parameters
      if (!email || !token_hash || type !== "email") {
        console.error("Missing verification parameters");
        navigate("/link-expired");
        return;
      }

      try {
        // ✅ 3. Verify token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token_hash,
          type: "email"
        });

        if (error || !data.user) {
          throw error || new Error("Verification failed");
        }

        // ✅ 4. Redirect to password setup
        navigate(`/EmailConfirmed?email=${encodeURIComponent(email)}`);
      } catch (error) {
        console.error("Verification error:", error);
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