'use client';
import { googleSignOut } from "@/app/actions/auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Logout ({username} : {username?: String | null}) {
    const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const isMobileAPK = typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNative;

    try {
      if (isMobileAPK) {
        await signOut({ redirect: false });
        router.push("/account/sign-in"); 
      } else {
        await googleSignOut();
      }
    } catch (error) {
      console.error("Sign out process failed:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };
    return(
            <button type="button" onClick={handleLogout} disabled={loading} className="bg-white-600 text-black font-medium cursor-pointer px-4 py-2 rounded-lg border-gray-500 border btn text-xs font-medium">{loading ? "Logging out..." : `Logout (${username || "User"})`}</button>
    )
}