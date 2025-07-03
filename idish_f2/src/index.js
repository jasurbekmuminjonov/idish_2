import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./assets/global.css";
import "./assets/modal.css";
import { Routera } from "./router";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";
import { Loading } from "./components/loading/loading";
import { store } from "./context/store";
import { ChakraProvider } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ChakraProvider>
      <Provider store={store}>
        <SnackbarProvider>
          <Loading />
<<<<<<< HEAD
          <Routera />
          {/* <p>Sayt ishlab chiqilmoqda tez orada ishga tushadi, xatoliklar kelib chiqmasligi uchun shunday qilinmoqda</p> */}
=======
          {/* <Routera /> */}
          <p>
            Sayt ishlab chiqilmoqda tez orada ishga tushadi, xatoliklar kelib
            chiqmasligi uchun shunday qilinmoqda
          </p>
>>>>>>> 1c3a0b98a493c0fbd0bd50346eb4c258067c2483
        </SnackbarProvider>
      </Provider>
    </ChakraProvider>
  </BrowserRouter>
);
