"use client";

import React from "react";

// import Link from "next/link";

import { getBillingInfo } from "../actions";

type Res = Awaited<ReturnType<typeof getBillingInfo>>;

interface CurrentBillingProps {
  onSelectNewBilling: () => void;
}

const CurrentBilling = ({ onSelectNewBilling }: CurrentBillingProps) => {
  const [billing, setBilling] = React.useState<Res | null>(null);

  React.useEffect(() => {
    (async () => {
      const billingInfo = await getBillingInfo();
      setBilling(billingInfo);
    })();
  }, []);

  if (!billing) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Current Credits */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8 w-4xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">Credit Balance</h2>
            <p className="text-gray-600">1 Credit = 1 Conversation</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{billing.billing.credits_available.toLocaleString()} credits</p>
            <button onClick={onSelectNewBilling} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Buy More Credits
            </button>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {/* <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8 w-4xl">
        <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>This Month</span>
            <span>1,500 credits used</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last 24 hours</span>
            <span>150 credits used</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Average daily usage</span>
            <span>~120 credits</span>
          </div>
        </div>
      </div> */}

      {/* Payment Method */}
      {billing.billing.paystack_authorization?.last4 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8 w-4xl">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="font-medium">Visa ending in {billing.billing.paystack_authorization.last4}</p>
              <p className="text-sm text-gray-600">Expires {`${billing.billing.paystack_authorization.exp_month}/${billing.billing.paystack_authorization.exp_year}`}</p>
            </div>
            <button className="ml-auto text-blue-600">Update</button>
          </div>
        </div>
      )}

      {/* Billing History */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-4xl">
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>

        {billing.payments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No billing history available.</p>
            <p>Make your first purchase to see your billing history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Invoice ID</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {billing.payments.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3">{invoice.created_at.toLocaleDateString()}</td>
                    <td className="py-3">{invoice.id}</td>
                    <td className="py-3">{parseInt(invoice.amount).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${invoice.status === "success" ? "bg-green-100 text-green-800" :
                        invoice.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};


export default CurrentBilling;