import { apiSlice } from "./api.service";

export const debtApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDebt: builder.mutation({
      query: (debtData) => ({
        url: "/debts",
        method: "POST",
        body: debtData,
      }),
    }),
    getDebtsByClient: builder.query({
      query: (clientId) => ({
        url: `/debts/client/${clientId}`,
        method: "GET",
      }),
    }),
    payDebt: builder.mutation({
      query: ({ id, amount, currency }) => ({
        url: `/debts/pay/${id}`,
        method: "PUT",
        body: { amount, currency },
      }),
    }),
    getAllDebtors: builder.query({
      query: () => ({
        url: "/debts/debtors",
        method: "GET",
      }),
    }),
    getDailyPaymentsByStoreId: builder.query({
      query: ({ date, storeId }) => ({
        url: `/daily/debt`,
        method: "GET",
        params: { date, storeId },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateDebtMutation,
  useGetDebtsByClientQuery,
  usePayDebtMutation,
  useGetAllDebtorsQuery,
  useLazyGetDailyPaymentsByStoreIdQuery
} = debtApi;
