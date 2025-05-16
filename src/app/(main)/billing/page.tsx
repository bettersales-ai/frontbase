"use client";

import React from "react";

import dynamic from "next/dynamic";

import CurrentBilling from "./_sections/CurrentBilling";
const NewBilling = dynamic(() => import( "./_sections/NewBilling"), {ssr: false});

type Section = "current_billing" | "new_billing";

export default function BillingPage() {
  const [currentSection, setCurrentSection] = React.useState<Section>("current_billing");

  const onSelectNewBilling = () => {
    setCurrentSection("new_billing");
  }

  const goBack = () => {
    setCurrentSection("current_billing");
  }

  return (
    <div className="flex flex-col items-center pt-16 mb-6 w-full h-full">
      <div className="text-center space-y-1 mb-12">
        <h1 className="mb-2 text-4xl tracking-tight font-extrabold text-gray-900">Billing</h1>
        <p className="text-gray-600 text-xs">Current billing and history </p>
      </div>

      {currentSection === "current_billing" && (
        <CurrentBilling
          onSelectNewBilling={onSelectNewBilling}
        />
      )}

      {currentSection === "new_billing" && (
        <NewBilling goBack={goBack} />
      )}
    </div>
  )
}
