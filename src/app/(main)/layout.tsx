import React from "react";

import NavBar from "./_components/NavBar";


interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <div className="flex flex-col items-center w-full min-h-svh bg-gray-50">
      <NavBar />
      {children}
    </div>
  );
}