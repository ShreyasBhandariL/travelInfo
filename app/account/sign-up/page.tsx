"use client"
import { googleSignIn, credentialSignUp } from "@/app/actions/auth";
import Link from "next/link";
import { useState } from "react";

const Signup = () => {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null); 
        const result = await credentialSignUp(formData);
        
        if (result?.error) {
            setError(result.error);
        }
    };

    return(
        <div className="flex flex-col items-center bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 justify-center m-auto w-full max-w-sm">
            <div className="flex flex-col items-center gap-6 px-8 pt-8 pb-4 w-full">
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        MumbaiGetaways
                    </span>
                    <h5 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                        Create an Account
                    </h5>
                    <p className="font-normal text-xs text-zinc-400 dark:text-zinc-500">
                        Please fill in your details to join us
                    </p>
                </div>
                
                <div className="flex flex-col items-center w-full">
                    <form action={googleSignIn} className="w-full">
                        <button 
                            type="submit" 
                            className="bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white cursor-pointer font-semibold px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs w-full transition-all flex items-center justify-center gap-2"
                        >
                            Continue with Google
                        </button>
                    </form>
                    
                    <div className="relative flex py-4 items-center w-full">
                        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                        <span className="flex-shrink mx-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                    </div>

                    {error && (
                        <div className="w-full text-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg p-2 text-[11px] font-semibold border border-red-200 dark:border-red-900/50 mb-2 animate-pulse">
                            {error}
                        </div>
                    )}
                    
                    <form action={handleSubmit} className="flex flex-col items-center w-full gap-3">
                        <div className="w-full flex flex-col gap-1">
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Enter your email" 
                                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                required
                            />
                        </div>
                        
                        <div className="w-full flex flex-col gap-1">
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Create a password" 
                                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg cursor-pointer transition-all w-full mt-2"
                        >
                            Get Started
                        </button>
                    </form>
                </div>
            </div>
            
            <hr className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            
            <div className="flex items-center justify-center w-full py-4 px-6 bg-zinc-50 dark:bg-zinc-950 rounded-b-xl">
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-center">
                    Already have an account?{" "}
                    <Link href="/account/sign-in" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Signup;