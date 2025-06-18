import React, { useState } from "react";
import { Layout, Menu, Button, Modal, Card, Table, Badge } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TeamOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  MoneyCollectOutlined,
  ScheduleOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { FaChartLine, FaList } from "react-icons/fa6";
import { BiTransferAlt } from "react-icons/bi";

import { LuTicketPercent } from "react-icons/lu";

// Asosiy sahifa komponentlari
import Admin from "../Adminlar/Adminlar";
import Ombor from "../Ombor/Ombor";
import Product from "../Product/Product";
import Kassa from "../Kassa/Kassa";
import Client from "../Client/Client";
import Debtors from "../Debt/Debtors";
import Sales from "../Sotuv-tarix/Sotuv";
import Brak from "../Brak/Brak";
import Expense from "../Rasxod/Expense";
import Promo from "../promo/Promo";
import Statistika from "../statistika/statistika";
import Investitsiya from "../investment/Investitsiya";
import Partner from "../partner/Partner";
import ReconciliationAct from "../reconciliation-act/ReconciliationAct";
import ReportAdd from "../report-add/ReportAdd";

// Yangi qo‘shilgan bo‘limlar
import Hodimlar from "../hodimlar/Hodimlar";
import OylikXisobot from "../Oylik/Oylik";
import Stores from "../Stores/Stores";
import Transportion from "../transportion/Transportion";
import { IoIosNotifications } from "react-icons/io";
import Daily from "../Daily/Daily";
const { Header, Sider, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  let sendedData = JSON.parse(localStorage.getItem("newSales")) || [];
  const success = JSON.parse(localStorage.getItem("acsess") || "{}");
  console.log(success);
  
  const role = localStorage.getItem("role");
  const [selectedPage, setSelectedPage] = useState(
    role === "admin" ? "home" : "product"
  );

  const toggle = () => {
    setCollapsed(!collapsed);
  };
  const stm = {
    kg_quantity: 'kg',
    quantity: 'dona',
    box_quantity: 'karobka',
    package_quantity: 'pachka',
  }
  const renderContent = () => {
    switch (selectedPage) {
      case "admin":
        return <Admin />;
      case "daily":
        return <Daily />;
      case "statistika":
        return <Statistika />;
      case "ombor":
        return <Ombor />;
      case "product":
        return <Product />;
      case "partner":
        return <Partner />;
      case "kassa":
        return <Kassa />;
      case "client":
        return <Client />;
      case "debtors":
        return <Debtors />;
      case "promo":
        return <Promo />;
      case "sales":
        return <Sales />;
      case "brak":
        return <Brak />;
      case "expense":
        return <Expense />;
      case "report":
        return <ReconciliationAct />;
      case "report-add":
        return <ReportAdd />;
      case "hodimlar":
        return <Hodimlar />;
      case "oylik":
        return <OylikXisobot />;
      case "stores":
        return <Stores />;
      case "transportions":
        return <Transportion />;
      case "home":
      default:
        return <Investitsiya />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={role === "admin" ? ["home"] : ["product"]}
          selectedKeys={[selectedPage]}
          onClick={(e) => setSelectedPage(e.key)}
        >
          {success?.home && (
            <Menu.Item key="home" icon={<HomeOutlined />}>
              Домашняя страница
            </Menu.Item>
          )}
          {success?.daily && (
            <Menu.Item key="daily" icon={<FaList />}>
              Ежедневный отчет
            </Menu.Item>
          )}
          {success?.statistika && (
            <Menu.Item key="statistika" icon={<FaChartLine />}>
              Статистика
            </Menu.Item>
          )}
          {success?.admin && (
            <Menu.Item key="admin" icon={<UserOutlined />}>
              Админы
            </Menu.Item>
          )}
          {success?.ombor && (
            <Menu.Item key="ombor" icon={<AppstoreOutlined />}>
              Склады
            </Menu.Item>
          )}
          {success?.stores && (
            <Menu.Item key="stores" icon={<AppstoreOutlined />}>
              Магазины
            </Menu.Item>
          )}
          {(success?.product || role === "warehouse") && (
            <Menu.Item key="product" icon={<ShoppingOutlined />}>
              Продукты
            </Menu.Item>
          )}
          {success?.partner && (
            <Menu.Item key="partner" icon={<UserSwitchOutlined />}>
              Поставщики
            </Menu.Item>
          )}
          {success?.client && (
            <Menu.Item key="client" icon={<TeamOutlined />}>
              Покупатели
            </Menu.Item>
          )}
          {success?.debtors && (
            <Menu.Item key="debtors" icon={<CreditCardOutlined />}>
              Должники
            </Menu.Item>
          )}
          {success?.promo && (
            <Menu.Item key="promo" icon={<LuTicketPercent />}>
              Промокоды
            </Menu.Item>
          )}
          {success?.sales && (
            <Menu.Item key="sales" icon={<BarChartOutlined />}>
              Проданные товары
            </Menu.Item>
          )}
          {success?.brak && (
            <Menu.Item key="brak" icon={<ExclamationCircleOutlined />}>
              Брак 
            </Menu.Item>
          )}
          {success?.expense && (
            <Menu.Item key="expense" icon={<MoneyCollectOutlined />}>
              Расходы
            </Menu.Item>
          )}
          {success?.report && (
            <Menu.Item key="report" icon={<ScheduleOutlined />}>
              Акт сверка
            </Menu.Item>
          )}
          {success?.["report-add"] && (
            <Menu.Item key="report-add" icon={<UserAddOutlined />}>
              Добавить остаток
            </Menu.Item>
          )}
          {success?.hodimlar && (
            <Menu.Item key="hodimlar" icon={<TeamOutlined />}>
              Сотрудники
            </Menu.Item>
          )}
          {success?.oylik && (
            <Menu.Item key="oylik" icon={<DollarOutlined />}>
              Заплата 
            </Menu.Item>
          )}

          {(success?.transportions || role === "warehouse") && (
            <Menu.Item key="transportions" icon={<ShoppingOutlined />}>
              Передача товара
            </Menu.Item>
          )}
        </Menu>

      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: "0 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button type="primary" onClick={toggle}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <Button
            onClick={() => setOpenModal(true)}
            type="link"
            style={{ padding: 0 }}
          >
            <Badge
              count={sendedData.length}
              style={{
                backgroundColor: "red",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 0 0 2px #fff",
              }}
              offset={[-5, 5]}
              showZero={false}
            >
              <IoIosNotifications color="white" size={30} />
            </Badge>
          </Button>

          <Modal
            footer={null}
            open={openModal}
            onCancel={() => setOpenModal(false)}
            title="Yuborilgan buyurtmalar"
          >
            {sendedData?.map((item, index) => (
              <Card
                key={index}
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.sender.name}</span>
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        const newArr = sendedData.filter(
                          (el) => el.sender._id !== item.sender._id
                        );
                        localStorage.setItem(
                          "newSales",
                          JSON.stringify(newArr)
                        );
                        // Modalni yangilash uchun sahifani refresh qilmasdan state update qiling:
                        setOpenModal(false);
                        setTimeout(() => setOpenModal(true), 0);
                      }}
                    />
                  </div>
                }
              >
                <Table
                  size="small"
                  columns={[
                    {
                      title: "Mahsulot nomi",
                      dataIndex: ["productId", "name"],
                    },
                    {
                      title: "Birlik",
                      dataIndex: "unit",
                      render: (text) => stm[text] || text,
                    },
                    {
                      title: "Soni",
                      dataIndex: "quantity",
                    },
                  ]}
                  dataSource={item.products}
                />
              </Card>
            ))}
          </Modal>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            padding: 6,
            minHeight: 280,
            minWidth: 280,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
