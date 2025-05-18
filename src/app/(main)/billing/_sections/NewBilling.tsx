"use client";

import React from "react";

import { toast } from "sonner";
import { useLogSnag } from "@logsnag/next";
import { usePaystackPayment } from "react-paystack";

import { getBillingPrices, getCurrentUser } from "../actions";


type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;
type CreditPack = Awaited<ReturnType<typeof getBillingPrices>>[number];

const config = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
};

interface NewBillingProps {
  goBack: () => void;
}

const NewBilling = ({ goBack }: NewBillingProps) => {
  const [creditPacks, setCreditPacks] = React.useState<CreditPack[]>([]);
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null);

  const { track } = useLogSnag();
  const initializePayment = usePaystackPayment(config);

  const onSuccess = () => {
    toast.success("Payment successful. Your credits will be added to your account shortly");
    goBack();
  };

  const onClose = () => {
    console.log("closed");
    toast.error("Payment closed");
    track({
      channel: "payments",
      event: "Payment closed",
      user_id: currentUser!.id,
      icon: "❌",
    });
  }

  React.useEffect(() => {
    (async () => {
      const prices = await getBillingPrices();
      setCreditPacks(prices);
    })();
    (async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    })();
  }, []);

  return (
    <div className="w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPacks.map((pack) => (
          <div
            key={pack.name}
            className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-2xl font-bold">{pack.name}</h2>
            <div className="text-3xl font-bold my-4">₦ {parseInt(pack.price).toLocaleString()}</div>
            <div className="text-lg text-gray-600 mb-4">
              {pack.credits.toLocaleString()} Credits
            </div>
            <ul className="space-y-2 mb-6">
              {pack.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                initializePayment({
                  onSuccess,
                  onClose,
                  config: {
                    lastname: currentUser!.name.split(" ")[1],
                    firstname: currentUser!.name?.split(" ")[0],
                    metadata: {
                      plan_id: pack.id,
                      user_id: currentUser!.id,
                      "custom_filters": {
                        "recurring": true
                      },
                      custom_fields: [
                        {
                          value: pack.name,
                          display_name: "Plan",
                          variable_name: "plan",
                        }
                      ]
                    },
                    email: currentUser!.email,
                    amount: parseInt(pack.price) * 100,
                    reference: (new Date()).getTime().toString(),
                  }
                });
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Buy Credits
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={goBack}
          className="hover:underline text-blue-600 text-sm font-semibold"
          type="button"
          aria-label="Back to Billing"
          title="Back to Billing"
        >
          Back to Billing
        </button>
      </div>
    </div>
  );
};

export default NewBilling;

