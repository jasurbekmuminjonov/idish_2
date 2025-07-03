import { apiSlice } from "./api.service";

export const debtApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDebt: builder.mutation({
      query: (debtData) => ({
        url: "/debts",
        method: "POST",
        body: debtData,
      }),
      invalidatesTags: ["Debt"],
    }),
    getDebtsByClient: builder.query({
      query: (clientId) => ({
        url: `/debts/client/${clientId}`,
        method: "GET",
      }),
      providesTags: ["Debt"],
    }),
    payDebt: builder.mutation({
      query: ({ id, amount, currency, type }) => ({
        url: `/debts/pay/${id}`,
        method: "PUT",
        body: { amount, currency, type },
      }),
      invalidatesTags: ["Debt"],
    }),
    getAllDebtors: builder.query({
      query: () => ({
        url: "/debts/debtors",
        method: "GET",
      }),
      providesTags: ["Debt"],
    }),
    getDailyPaymentsByStoreId: builder.query({
      query: ({ date, storeId }) => ({
        url: `/daily/debt`,
        method: "GET",
        params: { date, storeId },
      }),
      providesTags: ["Debt"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateDebtMutation,
  useGetDebtsByClientQuery,
  usePayDebtMutation,
  useGetAllDebtorsQuery,
  useLazyGetDailyPaymentsByStoreIdQuery,
} = debtApi;
