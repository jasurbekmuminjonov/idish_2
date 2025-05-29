import React, { memo, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
import Login from "./pages/auth/login";
import Home from "./pages/Home/Home";
import Kassa from "./pages/Kassa/Kassa";
import Debtors from "./pages/Debt/Debtors";
import socket from "./socket";
import smsAudio from "./assets/sms.mp3";
import { notification } from "antd";
export const Routera = memo(() => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token") || null;

  useEffect(() => {
    if (role === "admin") {
      const handleUpdateOrder = (data) => {
        notification.open({
          message: "Yangi xabar",
          description: "yaaangi",
          duration: 0, // Faqat X bosilganda yopiladi
          placement: "topRight",
        });
        const audio = new Audio(smsAudio);
        audio.play();
      };
      socket.on("newTransportion", handleUpdateOrder);
      return () => socket.off("newTransportion", handleUpdateOrder);
    }
  }, []);

  return (
    <>
      {token ? (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                role === "admin" || role === "warehouse" ? <Home /> : <Kassa />
              }
            />
            <Route path="/debtors" element={<Debtors />} />
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Route>
        </Routes>
      ) : (
        <Login />
      )}
    </>
  );
});

export default Routera;
