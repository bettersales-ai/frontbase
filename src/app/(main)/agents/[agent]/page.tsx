import React from "react";

import { format } from "date-fns";

import Actions from "./_components/Actions";
import { getSalesRepActiveConversations, getSalesRepData, getSalesRepSuccessRate, getSalesRepTotalConversations } from "./actions";


interface AgentPageProps {
  params: Promise<{
    agent: string;
  }>;
}

const AgentPage: React.FC<AgentPageProps> = async ({ params }) => {
  const { agent } = await params;

  const agentData = await getSalesRepData(agent);

  const successRate = await getSalesRepSuccessRate(agent);
  const totalConversations = await getSalesRepTotalConversations(agent);
  const activeConversations = await getSalesRepActiveConversations(agent);

  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">{agentData.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-8 px-24 w-full h-full">
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between h-40">
          <p className="text-gray-600 text-lg font-medium">Total Conversations</p>
          <p className="text-5xl tracking-tight font-bold text-gray-900">{totalConversations}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between h-40">
          <p className="text-gray-600 text-lg font-medium">Success Rate</p>
          <p className="text-5xl tracking-tight font-bold text-gray-900">{successRate}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between h-40">
          <p className="text-gray-600 text-lg font-medium">Currently Active Conversations</p>
          <p className="text-5xl tracking-tight font-bold text-gray-900">{activeConversations}</p>
        </div>
      </div>

      <Actions
        id={agent}
        name={agentData.name}
        currentStatus={agentData.is_active}
      />

      <div className="flex flex-col gap-8 px-24 mt-8 w-[80%]">
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-900">Standard Operating Procedure</h2>
          <p className="text-md font-normal text-gray-500">{agentData.sop}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">Customer Qualification</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex flex-col">
              <h6 className="text-md small-caps">Initial Message</h6>
              <p className="text-md">{agentData.initial_message}</p>
            </div>
            <div className="flex flex-col">
              <h6 className="text-md small-caps">Ideal Customer Profile</h6>
              <p className="text-md">{agentData.ideal_customer_profile}</p>
            </div>
            <div className="flex flex-col">
              <h6 className="text-md small-caps">Created At</h6>
              <p className="text-md">{format(new Date(agentData.created_at), "dd/MM/yyyy")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">WhatsApp Credentials</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex flex-col">
              <h6 className="text-md small-caps">Phone Number</h6>
              <p className="text-md">{agentData.whatappCredentials.phoneNumber}</p>
            </div>
            <div className="flex flex-col">
              <h6 className="text-md small-caps">Phone Number ID</h6>
              <p className="text-md">{agentData.whatappCredentials.phoneNumberId}</p>
            </div>
            <div className="flex flex-col">
              <h6 className="text-md small-caps">Access Token</h6>
              <p className="text-md">••••{agentData.whatappCredentials.accessToken.slice(-4)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
