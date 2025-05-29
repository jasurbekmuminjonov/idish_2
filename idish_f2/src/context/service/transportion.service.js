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

    }),
    overrideExisting: false,
});

export const {
    useCreateTransportionMutation,
    useGetGotTransportionsQuery,
    useGetSentTransportionsQuery
} = transportionApi;