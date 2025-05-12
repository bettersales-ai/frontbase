"use client";

import React from "react";
import { useRouter } from "next/navigation";

import * as Yup from "yup";
import { useFormik } from "formik";

import { createProduct } from "./actions";

const validationSchema = Yup.object({
  name: Yup.string().required("Product name is required"),
  price: Yup.string().required("Price is required"),
  image: Yup.string().required("Image URL is required"),
  stock: Yup.string().required("Stock quantity is required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string().required("Description is required"),
});

const AddProduct = (): React.ReactElement => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      image: "",
      stock: "",
      category: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await createProduct(values);
      router.push("/products");
    },
  });

  type FormikErrors = keyof typeof formik.errors;
  type FormikTouched = keyof typeof formik.touched;

  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">Add Product</h1>
        <p className="text-gray-600 text-lg">Create a new product</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="w-full max-w-3xl px-6">
        <div className="space-y-8">
          {[
            { name: "name", label: "Product Name", type: "text" },
            { name: "price", label: "Price", type: "text" },
            { name: "image", label: "Image URL", type: "text" },
            { name: "stock", label: "Stock", type: "text" },
            { name: "category", label: "Category", type: "text" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                {...formik.getFieldProps(field.name)}
                className={`w-full p-3 outline-blue-500 border bg-white rounded-lg ${
                  formik.touched[field.name as FormikTouched]
                  && formik.errors[field.name as FormikErrors] 
                  ? "border-red-500" 
                  : "border-gray-200"
                }`}
              />
              {formik.touched[field.name as FormikTouched] && formik.errors[field.name as FormikErrors] && (
                <div className="text-red-500 text-sm">{formik.errors[field.name as FormikErrors]}</div>
              )}
            </div>
          ))}
          
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              {...formik.getFieldProps("description")}
              className={`w-full p-3 outline-blue-500 border bg-white rounded-lg h-32 ${
                formik.touched.description && formik.errors.description 
                ? "border-red-500" 
                : "border-gray-200"
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm">{formik.errors.description}</div>
            )}
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
            >
              {formik.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;