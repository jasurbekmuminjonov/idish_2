// Example api.service.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "https://lola-crm-server.vercel.app/api",
  // baseUrl: "https://lola-crm-server.vercel.app/api",
  // baseUrl: "https://kwmkqg1t-8081.euw.devtunnels.ms/api",

  // baseUrl: `https://idish25.richman.uz/api`, 
  baseUrl: "http://localhost:8080/api",


  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    signInAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useSignInAdminMutation } = apiSlice;
