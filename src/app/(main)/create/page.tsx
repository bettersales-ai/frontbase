/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { useRouter } from "next/navigation";

import * as Yup from "yup";
import { useFormik } from "formik";
import { createSalesRep } from "./actions";


const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8 w-full max-w-3xl">
    <div className="relative flex justify-between">
      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
        <div
          className="absolute h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="relative flex flex-col items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
          }`}>
          1
        </div>
        <span className="mt-2 text-sm font-medium text-gray-500">Agent Info</span>
      </div>

      <div className="relative flex flex-col items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
          }`}>
          2
        </div>
        <span className="mt-2 text-sm font-medium text-gray-500">Whatsapp Configuration</span>
      </div>

      <div className="relative flex flex-col items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
          }`}>
          3
        </div>
        <span className="mt-2 text-sm font-medium text-gray-500">Deploy</span>
      </div>
    </div>
  </div>
);

const validationSchema = Yup.object({
  name: Yup.string().required("Agent name is required"),
  sop: Yup.string().required("Standard operating procedure is required"),
  whatsappId: Yup.string().required("WhatsApp ID is required"),
  apiKey: Yup.string().required("API key is required"),
});

const Step1 = ({ formik }: { formik: any }) => (
  <div className="space-y-4 w-full">
    <div className="flex flex-col gap-1">
      <label>Agent Name</label>
      <input
        type="text"
        placeholder="Agent Name"
        {...formik.getFieldProps("name")}
        className={`w-full p-2 border rounded ${formik.touched.name && formik.errors.name ? "border-red-500" : ""}`}
      />
      {formik.touched.name && formik.errors.name && (
        <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
      )}
    </div>
    <div className="flex flex-col gap-1">
      <label>Standard of Operation</label>
      <textarea
        placeholder="Standard Operating Procedure"
        {...formik.getFieldProps("sop")}
        className={`w-full p-2 border rounded h-32 ${formik.touched.sop && formik.errors.sop ? "border-red-500" : ""
          }`}
      />
      {formik.touched.sop && formik.errors.sop && (
        <div className="text-red-500 text-sm mt-1">{formik.errors.sop}</div>
      )}
    </div>
  </div>
);

const Step2 = ({ formik }: { formik: any }) => (
  <div className="space-y-4 w-full max-w-md">
    <div className="flex flex-col gap-1">
      <label>Whatsapp Number ID</label>
      <input
        type="text"
        placeholder="WhatsApp Number ID"
        {...formik.getFieldProps("whatsappId")}
        className={`w-full p-2 border rounded ${formik.touched.whatsappId && formik.errors.whatsappId ? "border-red-500" : ""
          }`}
      />
      {formik.touched.whatsappId && formik.errors.whatsappId && (
        <div className="text-red-500 text-sm mt-1">{formik.errors.whatsappId}</div>
      )}
    </div>
    <div className="flex flex-col gap-1">
      <label>Whatsapp API Key</label>
      <input
        type="password"
        placeholder="WhatsApp API Key"
        {...formik.getFieldProps("apiKey")}
        className={`w-full p-2 border rounded ${formik.touched.apiKey && formik.errors.apiKey ? "border-red-500" : ""
          }`}
      />
      {formik.touched.apiKey && formik.errors.apiKey && (
        <div className="text-red-500 text-sm mt-1">{formik.errors.apiKey}</div>
      )}
    </div>
  </div>
);

const Step3 = ({ onDeploy }: { onDeploy: () => void }) => (
  <div className="text-center">
    <button
      onClick={onDeploy}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
    >
      Deploy Agent
    </button>
  </div>
);

const CreateAgent = (): React.ReactElement => {
  const [step, setStep] = React.useState(1);

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      sop: "",
      name: "",
      apiKey: "",
      whatsappId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Deploying agent with data:", values);
      formik.setSubmitting(true);
      await createSalesRep(
        values.name,
        values.sop,
        {
          accessToken: values.apiKey,
          phoneNumberId: values.whatsappId,
        }
      );
      formik.setSubmitting(false);
      router.push("/");
    },
  });

  const canProceed = () => {
    if (step === 1) {
      return !formik.errors.name && !formik.errors.sop && formik.touched.name && formik.touched.sop;
    }
    if (step === 2) {
      return !formik.errors.whatsappId && !formik.errors.apiKey &&
        formik.touched.whatsappId && formik.touched.apiKey;
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center pt-8 pb-8 w-full h-full">
      <div className="text-center space-y-1 mb-8">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">Create an Agent</h1>
        <p className="text-gray-600 text-lg">Create kick-ass ads for your business</p>
      </div>

      <StepIndicator currentStep={step} />

      <form className="flex flex-col items-center w-full max-w-xl" onSubmit={formik.handleSubmit}>
        {step === 1 && <Step1 formik={formik} />}
        {step === 2 && <Step2 formik={formik} />}
        {step === 3 && <Step3 onDeploy={formik.handleSubmit} />}

        <div className="mt-8 space-x-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className={`px-4 py-2 rounded-lg ${canProceed()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateAgent;