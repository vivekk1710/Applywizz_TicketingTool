// ✅ File: src/components/Auth/EmailVerifyRedirect.tsx
"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const EmailVerifyRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkVerification = async () => {
            // 1. Extract the FRAGMENT (part after #)
            const fragment = window.location.hash.substring(1); // Remove the "#"
            const fragmentParams = new URLSearchParams(fragment);
            console.log("Fragment:", window.location.hash);

            // 2. Get token + type from FRAGMENT
            const access_token = fragmentParams.get("access_token");
            const type = fragmentParams.get("type");

            // 3. Get email from query string (part after ?)
            const queryParams = new URLSearchParams(window.location.search);
            const email = queryParams.get("email");

            // 4. Verify token with Supabase
            if (email && access_token && type === "email") {
                const { data, error } = await supabase.auth.verifyOtp({
                    type: "email",
                    token: access_token, // Use "token" (not token_hash)
                    email,
                });

                if (data.user) {
                    navigate("/EmailConfirmed?email=" + encodeURIComponent(email));
                } else {
                    navigate("/LinkExpired");
                }
            } else {
                navigate("/LinkExpired");
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


// Updated File: src/components/Auth/EmailVerifyRedirect.tsx
// "use client"; import { useEffect } from "react"; const EmailVerifyRedirect = () => {
//     useEffect(() => { console.log("Confirmation link clicked"); }, []); return (<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4"><div className="text-blue-600 text-lg font-medium">        Confirmation link clicked!
//     </div></div>);
// }; export default EmailVerifyRedirect;
