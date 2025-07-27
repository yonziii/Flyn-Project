"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

// Google Icon SVG Component
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.187-8.164l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.128,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export default function SignUpPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log('Sign up successful:', data);
        // Handle signup logic here

        // Redirect to homepage after successful signup
        router.push('/');  // or router.push('/dashboard') depending on your route
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Panel: Branding (Identical to Login Page) */}
            <div className="relative hidden lg:flex flex-col items-center justify-center bg-gray-50 p-12">
                <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <div className="z-10 text-center">
                    <Link href="/" className="flex items-center justify-center mb-8">
                        <Image src="/flyn.png" alt="Flyn Logo" width={40} height={40} />
                        <span className="text-2xl font-bold ml-2 text-gray-800">Flyn</span>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Clarity for your cash flow.
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
                        From scattered receipts and statements to clear, actionable insights. All in one place.
                    </p>
                </div>
            </div>

            {/* Right Panel: Sign-Up Form */}
            <div className="flex items-center justify-center p-6 sm:p-12 w-full">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="flex items-center justify-center">
                            <Image src="/flyn.png" alt="Flyn Logo" width={32} height={32} />
                            <span className="text-xl font-bold ml-2 text-gray-800">Flyn</span>
                        </Link>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center lg:text-left">
                        Get Started with Flyn
                    </h2>
                    <p className="text-gray-600 mt-2 text-center lg:text-left">
                        Create an account to begin your journey to financial clarity.
                    </p>

                    <div className="mt-8 space-y-6">
                        <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
                            <GoogleIcon />
                            Sign up with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">or</span>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label className="text-sm font-medium" htmlFor="fullName">
                                    Full Name
                                </label>
                                <input
                                    {...register("fullName", {
                                        required: "Full name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Name must be at least 2 characters"
                                        }
                                    })}
                                    className={`flex h-10 w-full rounded-md border ${errors.fullName ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm mt-1`}
                                    placeholder="John Doe"
                                    type="text"
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm mt-1`}
                                    placeholder="name@example.com"
                                    type="email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters"
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                                            message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                                        }
                                    })}
                                    className={`flex h-10 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm mt-1`}
                                    type="password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Must be at least 8 characters with uppercase, lowercase, and numbers.
                                </p>
                            </div>

                            <p className="text-xs text-gray-500">
                                By signing up, you agree to Flyn's{" "}
                                <Link className="underline hover:text-primary" href="#">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link className="underline hover:text-primary" href="#">
                                    Privacy Policy
                                </Link>
                                .
                            </p>

                            <button 
                                type="submit"
                                className="w-full h-10 px-4 py-2 bg-[#50D9C2] text-white font-semibold rounded-lg hover:bg-[#45B8A5] transition-colors"
                            >
                                Create Account
                            </button>
                        </form>
                        
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link className="font-semibold text-[#50D9C2] hover:underline" href="/login">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
