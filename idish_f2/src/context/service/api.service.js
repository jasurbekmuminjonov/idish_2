// context/service/api.service.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8080/api",
  // baseUrl: `https://idish25.richman.uz/api`,
  // baseUrl: `https://kwmkqg1t-8081.euw.devtunnels.ms/api`,

  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Обработка ошибок авторизации (401 Unauthorized)
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error && result?.error?.status === 401) {
    // Очистка хранилища при истёкшем или недействительном токене
    localStorage.clear();
    sessionStorage.clear();
    // Перезагрузка страницы для перенаправления на страницу логина
    window.location.reload();
  }
  return result;
};

// Создание API Slice с использованием RTK Query
export const apiSlice = createApi({
  reducerPath: "api", // Путь редьюсера в Redux store
  baseQuery: baseQueryWithReauth, // Кастомный baseQuery с обработкой ошибок
  tagTypes: [
    "update",
    "device",
    "Product",
    "Sale",
    "ProductPartner",
    "Report",
    "ActPartner",
    "Transportion",
  ], // Теги для управления кэшем
  endpoints: (builder) => ({}), // Пустые эндпоинты, так как они добавляются через injectEndpoints
});
