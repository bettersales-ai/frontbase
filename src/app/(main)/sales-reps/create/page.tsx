/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { z } from "zod";
import { toast } from "sonner";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { createSalesRep } from "./actions";
import { useLogSnag } from "@logsnag/next";


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
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
          1
        </div>
        <span className="mt-2 text-sm font-medium text-gray-500">Sales Rep Info</span>
      </div>

      <div className="relative flex flex-col items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
          2
        </div>
        <span className="mt-2 text-sm font-medium text-gray-500">Whatsapp Configuration</span>
      </div>

      <div className="relative flex flex-col items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
          3
        </div>
        <span className="mt-2 text-sm font-medium text-gray-500">Deploy</span>
      </div>
    </div>
  </div>
);

const validationSchema = toFormikValidationSchema(z.object({
  name: z.string().nonempty("Sales Rep name is required"),
  accessToken: z.string().nonempty("Access Token is required"),
  sop: z.string().nonempty("Standard operating procedure is required"),
  phoneNumber: z.string().nonempty("WhatsApp Number is required"),
  phoneNumberId: z.string().nonempty("WhatsApp Number ID is required"),
  initial_message: z.string().nonempty("Initial message is required"),
  ideal_customer_profile: z.string().nonempty("Ideal customer profile is required"),
}));

const Step1 = ({ formik }: { formik: any }) => (
  <div className="space-y-6 w-full">
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Sales Rep Name</label>
      <input
        type="text"
        placeholder="Enter name"
        {...formik.getFieldProps("name")}
        className={`w-full outline-blue-500 p-3 border bg-white rounded-lg ${formik.touched.name && formik.errors.name ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.name && formik.errors.name && (
        <div className="text-red-500 text-sm">{formik.errors.name}</div>
      )}
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Standard of Operation</label>
      <textarea
        placeholder="Describe the standard operating procedure"
        {...formik.getFieldProps("sop")}
        className={`w-full p-3 outline-blue-500 border bg-white rounded-lg h-32 ${formik.touched.sop && formik.errors.sop ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.sop && formik.errors.sop && (
        <div className="text-red-500 text-sm">{formik.errors.sop}</div>
      )}
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Initial Message</label>
      <textarea
        placeholder="Enter the initial message"
        {...formik.getFieldProps("initial_message")}
        className={`w-full p-3 outline-blue-500 border bg-white rounded-lg h-32 ${formik.touched.initial_message && formik.errors.initial_message ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.initial_message && formik.errors.initial_message && (
        <div className="text-red-500 text-sm">{formik.errors.initial_message}</div>
      )}
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Ideal Customer Profile</label>
      <textarea
        placeholder="Describe your ideal customer"
        {...formik.getFieldProps("ideal_customer_profile")}
        className={`w-full p-3 outline-blue-500 border bg-white rounded-lg h-32 ${formik.touched.ideal_customer_profile && formik.errors.ideal_customer_profile ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.ideal_customer_profile && formik.errors.ideal_customer_profile && (
        <div className="text-red-500 text-sm">{formik.errors.ideal_customer_profile}</div>
      )}
    </div>
  </div>
);

const Step2 = ({ formik }: { formik: any }) => (
  <div className="space-y-6 w-full max-w-md">
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Whatsapp Number ID</label>
      <input
        type="text"
        placeholder="Enter WhatsApp Number ID"
        {...formik.getFieldProps("phoneNumberId")}
        className={`w-full p-3 outline-blue-500 border bg-white rounded-lg ${formik.touched.phoneNumberId && formik.errors.phoneNumberId ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.phoneNumberId && formik.errors.phoneNumberId && (
        <div className="text-red-500 text-sm">{formik.errors.phoneNumberId}</div>
      )}
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Whatsapp API Key</label>
      <input
        type="password"
        placeholder="Enter WhatsApp API Key"
        {...formik.getFieldProps("accessToken")}
        className={`w-full p-3 outline-blue-500 border bg-white rounded-lg ${formik.touched.accessToken && formik.errors.accessToken ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.accessToken && formik.errors.accessToken && (
        <div className="text-red-500 text-sm">{formik.errors.accessToken}</div>
      )}
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">WhatsApp Number</label>
      <input
        type="text"
        placeholder="Enter WhatsApp Number"
        {...formik.getFieldProps("phoneNumber")}
        className={`w-full p-3 outline-blue-500 border bg-white rounded-lg ${formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500" : "border-gray-200"}`}
      />
      {formik.touched.phoneNumber && formik.errors.phoneNumber && (
        <div className="text-red-500 text-sm">{formik.errors.phoneNumber}</div>
      )}
    </div>
  </div>
);

const Step3 = ({ onDeploy, isSubmitting }: { onDeploy: () => void; isSubmitting: boolean }) => (
  <div className="text-center">
    <button
      onClick={onDeploy}
      disabled={isSubmitting}
      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
    >
      {isSubmitting ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Deploying...
        </>
      ) : (
        'Create Sales Rep'
      )}
    </button>
  </div>
);

const CreateSalesRep = (): React.ReactElement => {
  const { track } = useLogSnag();
  const [step, setStep] = React.useState(1);

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      sop: "",
      name: "",
      accessToken: "",
      phoneNumber: "",
      phoneNumberId: "",
      initial_message: "",
      ideal_customer_profile: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      formik.setSubmitting(true);
      await createSalesRep({
        name: values.name,
        sop: values.sop,
        initial_message: values.initial_message,
        ideal_customer_profile: values.ideal_customer_profile,
        whatsapp: {
          phoneNumber: values.phoneNumber,
          accessToken: values.accessToken,
          phoneNumberId: values.phoneNumberId,
        },
      });

      toast.success("Sales Rep created successfully");
      track({
        icon: "💁‍♀️",
        channel: "sales-rep",
        event: "Sales Rep Created",
      });

      formik.setSubmitting(false);
      router.push("/");
    },
  });

  const canProceed = () => {
    if (step === 1) {
      return !formik.errors.name && !formik.errors.sop && formik.touched.name && formik.touched.sop;
    }
    if (step === 2) {
      return !formik.errors.phoneNumberId && !formik.errors.accessToken &&
        formik.touched.phoneNumberId && formik.touched.accessToken;
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">Create a Sales Rep</h1>
        <p className="text-gray-600 text-lg">Create kick-ass ads for your business</p>
      </div>

      <StepIndicator currentStep={step} />

      <form className="flex flex-col items-center w-full max-w-2xl px-6" onSubmit={formik.handleSubmit}>
        {step === 1 && <Step1 formik={formik} />}
        {step === 2 && <Step2 formik={formik} />}
        {step === 3 && <Step3 onDeploy={formik.handleSubmit} isSubmitting={formik.isSubmitting} />}

        <div className="mt-8 space-x-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Previous
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${canProceed()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
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

export default CreateSalesRep;