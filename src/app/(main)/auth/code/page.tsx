"use client";

import React from "react";

import Link from "next/link";

import { verifyCode } from "./actions";

const VerifyCode = (): React.ReactElement => {
  const [code, setCode] = React.useState<string>("");
  const [countdown, setCountdown] = React.useState<number>(60);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const onClickSendCodeToEmail = async () => {
    await verifyCode(code);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-6 bg-white rounded-xl p-6">
        <div className="text-center space-y-1">
          <h1 className="mb-2 text-4xl tracking-tight font-extrabold text-gray-900">Grok My Fans</h1>
          <p className="text-gray-600 text-xs">Choose your preferred sign in method Choose your preferred sign in method</p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex flex-col items-center gap-3">
            <input
              type="code"
              placeholder="Enter your code"
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={onClickSendCodeToEmail}
              className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200 whitespace-nowrap"
            >
              Verify Code
            </button>
          </div>

        </div>

        <div className="text-[11px] text-gray-500 text-center">
          {countdown > 0 ? (
            <>Retry sending the code in{" "}<span className="text-gray-900 font-medium">{countdown}</span> seconds</>
          ) : (
            <>
              Haven&apos;t receieved code. Try again.{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary-hover font-medium"
              >
                Resend Code
              </Link>
            </>
          )}
          {/* <span className="text-gray-900 font-medium">{countdown}</span> seconds */}
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;