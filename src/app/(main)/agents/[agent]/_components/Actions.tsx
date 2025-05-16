"use client";

import React from "react";

import Link from "next/link";
import { updateSalesRepStatus } from "../actions";

interface ActionsProps {
  id: string;
  name: string;
  currentStatus: boolean;
}

const Actions = ({ id, name, currentStatus }: ActionsProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const toggleModal = () => setShowModal(val => !val);

  const confirmDeactivate = async () => {
    setLoading(true);
    await updateSalesRepStatus(id, !currentStatus);
    setLoading(false);
    setShowModal(false);
  }

  const action = React.useMemo(() => {
    if (currentStatus) {
      return "Deactivate";
    } else {
      return "Activate";
    }
  }, [currentStatus]);

  return (
    <div className="flex justify-center items-center w-full gap-2">
      <Link className="hover:bg-gray-200 px-4 py-1 rounded-lg" href="/">See Conversations</Link>
      <Link className="hover:bg-gray-200 px-4 py-1 rounded-lg" href={`/agents/${id}/update`}>Edit Sales rep</Link>
      <button onClick={toggleModal} className="hover:bg-gray-200 px-4 py-1 rounded-lg">{action}</button>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-xl font-bold mb-4">Deactivate {name}</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {action} this sales rep?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={toggleModal}
                className="px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >

                {loading ?
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </div>
                  : `${action} Sales Rep`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Actions;