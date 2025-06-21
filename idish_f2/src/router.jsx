// import React, { memo, useEffect } from "react";
// import { Routes, Route } from "react-router-dom";
// import Layout from "./layout/layout";
// import Login from "./pages/auth/login";
// import Home from "./pages/Home/Home";
// import Kassa from "./pages/Kassa/Kassa";
// import Debtors from "./pages/Debt/Debtors";
// import socket from "./socket";
// import smsAudio from "./assets/sms.mp3";
// import { notification } from "antd";
// export const Routera = memo(() => {
//   const role = localStorage.getItem("role");
//   const token = localStorage.getItem("access_token") || null;

//   useEffect(() => {
//     if (role === "admin") {
//       const handleUpdateOrder = (data) => {
//         notification.open({
//           message: "Yangi o'tkazma",
//           description: "o'tkazma qabul qiling yoki bekor qiling",
//           duration: 0, // Faqat X bosilganda yopiladi
//           placement: "topRight",
//           style: { background: "green", color: "white" },
//         });
//         const audio = new Audio(smsAudio);
//         audio.play();
//       };

//       const newSale = (data) => {
//         console.log(data);

//         notification.open({
//           message: "Yangi Sotuv",
//           description: "mahsulotni tayyorlang",
//           duration: 0,
//           placement: "topRight",
//           style: { background: "green", color: "white" },
//         });
//         const audio = new Audio(smsAudio);
//         audio.play();
//       };

//       socket.on("newTransportion", handleUpdateOrder);
//       socket.on("newSale", newSale);

//       return () => {
//         socket.off("newTransportion", handleUpdateOrder);
//         socket.off("newSale", newSale);
//       };
//     }
//   }, []);

//   return (
//     <>
//       {token ? (
//         <Routes>
//           <Route path="/" element={<Layout />}>
//             <Route
//               index
//               element={
//                 role === "admin" || role === "warehouse" ? <Home /> : <Kassa />
//               }
//             />
//             <Route path="/debtors" element={<Debtors />} />
//             <Route path="*" element={<h1>Page Not Found</h1>} />
//           </Route>
//         </Routes>
//       ) : (
//         <Login />
//       )}
//     </>
//   );
// });

// export default Routera;

import React, { memo, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
import Login from "./pages/auth/login";
import Home from "./pages/Home/Home";
import Kassa from "./pages/Kassa/Kassa";
import Debtors from "./pages/Debt/Debtors";
import socket from "./socket";
import smsAudio from "./assets/sms.mp3";
import { notification } from "antd";
import ReconciliationAct from "./pages/reconciliation-act/ReconciliationAct";

export const Routera = memo(() => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token") || null;
  const audioRef = useRef(null);
  // const { data: sentTransportions, refetch } = useGetSentTransportionsQuery();


  // Foydalanuvchi birinchi interaction qilganda audio-ni "aktiv" qilish
  useEffect(() => {
    const enableAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => { });
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.removeEventListener("click", enableAudio);
    };
    window.addEventListener("click", enableAudio);
    return () => window.removeEventListener("click", enableAudio);
  }, []);

  useEffect(() => {
    const handleUpdateOrder = (data) => {
      if (localStorage.getItem("role") !== "admin") return;
      notification.open({
        message: "Yangi o'tkazma",
        description: "o'tkazma qabul qiling yoki bekor qiling",
        duration: 0,
        placement: "topRight",
        style: { background: "white", color: "white" },
      });
      if (audioRef.current) audioRef.current.play().catch(() => { });
    };

    const newSale = (data) => {
      console.log(data);
      let { newSale, selectedWarehouse, sender } = data;
      let hodimId = localStorage.getItem("_id");
      console.log(hodimId, selectedWarehouse);
      if (hodimId !== selectedWarehouse) return;
      let getNewSales = JSON.parse(localStorage.getItem("newSales")) || [];

      // sender._id bo‘yicha qidiramiz
      const senderIndex = getNewSales.findIndex(
        (item) => item.sender && item.sender._id === sender._id
      );

      if (senderIndex !== -1) {
        getNewSales[senderIndex].products = [
          ...getNewSales[senderIndex].products,
          newSale,
        ];
      } else {
        getNewSales.push({
          sender,
          products: [newSale],
        });
      }

      localStorage.setItem("newSales", JSON.stringify(getNewSales));

      notification.open({
        message: "Yangi Sotuv",
        description: "mahsulotni tayyorlang",
        duration: 0,
        placement: "topRight",
        style: { background: "white", color: "white" },
      });
      if (audioRef.current) audioRef.current.play().catch(() => { });
    };

    socket.on("newTransportion", handleUpdateOrder);
    socket.on("newSale", newSale);

    return () => {
      socket.off("newTransportion", handleUpdateOrder);
      socket.off("newSale", newSale);
    };
  }, [role]);

  return (
    <>
      <audio ref={audioRef} src={smsAudio} preload="auto" />
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
            <Route path="/dalolatnoma" element={<ReconciliationAct />} />
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
