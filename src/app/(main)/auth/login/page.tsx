"use client";

import React from "react";
import { redirectUserToLogin, sendEmailVerification } from "./actions";


const Login = (): React.ReactElement => {
  const [email, setEmail] = React.useState<string>("");

  const onClickLoginWithGoogle = async () => {
    await redirectUserToLogin();
  };

  const onClickSendCodeToEmail = async () => {
    await sendEmailVerification(email);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-6 rounded-xl p-6">
        <div className="text-center space-y-1">
          <h1 className="mb-2 text-4xl tracking-tight font-extrabold text-gray-900">Audience Flow</h1>
          <p className="text-gray-600 text-xs">Choose your preferred sign in method Choose your preferred sign in method</p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex flex-col items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 bg-white shadow-xs rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={onClickSendCodeToEmail}
              className="w-full bg-primary hover:shadow-xs text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200 whitespace-nowrap"
            >
              Send Code
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClickLoginWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white hover:shadow-xs text-gray-900 text-sm font-medium border border-gray-300 rounded-lg px-4 py-2.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

        </div>

        <div className="text-[11px] text-gray-500 text-center">
          By using this service, you agree to our{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;