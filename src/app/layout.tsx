import React from "react";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "sonner";
import { LogSnag } from "@logsnag/next/server";
import { LogSnagProvider } from "@logsnag/next";

import "./globals.css";

const LOGSNAG_TOKEN = process.env.LOGSNAG_TOKEN || "";
const LOGSNAG_PROJECT = process.env.LOGSNAG_PROJECT || "";

const logsnag = new LogSnag({
  token: LOGSNAG_TOKEN,
  project: LOGSNAG_PROJECT,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kick Ads",
  description: "Create kick ass ads for your business",
};


interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  if(process.env.NODE_ENV === "development") {
    logsnag.disableTracking();
  }

  return (
    <html lang="en">
      <head>
        <LogSnagProvider
          token={LOGSNAG_TOKEN}
          project={LOGSNAG_PROJECT}
        />
      </head>
      <body className={`${inter.className} ${inter.variable} antialiased text-gray-800`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}