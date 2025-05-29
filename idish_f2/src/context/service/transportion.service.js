import { update } from "../../../../idish_b2/models/Transportion";
import { apiSlice } from "./api.service";

export const transportionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTransportion: builder.mutation({
      query: (productData) => ({
        url: "/transportion/create",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Transportion"],
    }),
    getSentTransportions: builder.query({
      query: () => ({
        url: "/transportion/sent",
        method: "GET",
      }),
      providesTags: ["Transportion"],
    }),
    getGotTransportions: builder.query({
      query: () => ({
        url: "/transportion/got",
        method: "GET",
      }),
      providesTags: ["Transportion"],
    }),

    // update
    acceptTransportion: builder.mutation({
      query: (id) => ({
        url: "/transportion/accept/:" + id,
        method: "PUT",
        body: "",
      }),
      invalidatesTags: ["Transportion"],
    }),
    cencelTransportion: builder.mutation({
      query: (id) => ({
        url: "/transportion/reject/:" + id,
        method: "PUT",
        body: "",
      }),
      invalidatesTags: ["Transportion"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateTransportionMutation,
  useGetGotTransportionsQuery,
  useGetSentTransportionsQuery,
  useAcceptTransportionMutation,
  useCencelTransportionMutation,
} = transportionApi;
