import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
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
} from "@ant-design/icons";
import { FaChartLine } from "react-icons/fa6";
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

const { Header, Sider, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");
  const success = JSON.parse(localStorage.getItem('acsess') || "{}");
  const role = localStorage.getItem('role');

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const renderContent = () => {
    switch (selectedPage) {
      case "admin":
        return <Admin />;
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
          defaultSelectedKeys={["home"]}
          selectedKeys={[selectedPage]}
          onClick={(e) => setSelectedPage(e.key)}
        >
          {
            role === 'admin' && (
              <Menu.Item key="home" icon={<HomeOutlined />}>
                Bosh sahifa
              </Menu.Item>
            )
          }
          {success?.SalesStatistics && (
            <Menu.Item key="statistika" icon={<FaChartLine />}>
              Statistika
            </Menu.Item>
          )}
          {success?.adminlar && (
            <Menu.Item key="admin" icon={<UserOutlined />}>
              Adminlar
            </Menu.Item>
          )}
          {role === 'admin' && (
            <Menu.Item key="ombor" icon={<AppstoreOutlined />}>
              Omborlar
            </Menu.Item>
          )}
          {success?.dokon && (
            <Menu.Item key="stores" icon={<AppstoreOutlined />}>
              Do'konlar
            </Menu.Item>
          )}

          {success?.dokon && (
            <Menu.Item key="kassa" icon={<DollarOutlined />}>
              Kassa
            </Menu.Item>
          )}
          <Menu.Item key="product" icon={<ShoppingOutlined />}>
            Mahsulotlar
          </Menu.Item>
          {
            role === 'warehouse' && (
              <Menu.Item key="transport" icon={<BiTransferAlt />}>
                Tovar jo'natish
              </Menu.Item>
            )
          }
          {
            role === 'admin' && (
              <Menu.Item key="partner" icon={<UserSwitchOutlined />}>
                Yetkazib beruvchilar
              </Menu.Item>
            )
          }
          {success?.dokon && (
            <Menu.Item key="client" icon={<TeamOutlined />}>
              Xaridorlar
            </Menu.Item>
          )}
          {success?.qarzdorlar && (
            <Menu.Item key="debtors" icon={<CreditCardOutlined />}>
              Qarzdorlar
            </Menu.Item>
          )}
          {
            role === 'admin' && (
              <Menu.Item key="promo" icon={<LuTicketPercent />}>
                Promokodlar
              </Menu.Item>
            )}
          {success?.sotuv_tarixi && (
            <Menu.Item key="sales" icon={<BarChartOutlined />}>
              Sotilgan Mahsulotlar
            </Menu.Item>
          )}
          {success?.vazvratlar && (
            <Menu.Item key="brak" icon={<ExclamationCircleOutlined />}>
              Brak Mahsulotlar
            </Menu.Item>
          )}
          {success?.xarajatlar && (
            <Menu.Item key="expense" icon={<MoneyCollectOutlined />}>
              Rasxodlar
            </Menu.Item>
          )}
          {success?.xisobot && (
            <Menu.Item key="report" icon={<ScheduleOutlined />}>
              Dalolatnoma
            </Menu.Item>
          )}
          {
            role === 'admin' && (
              <Menu.Item key="report-add" icon={<UserAddOutlined />}>
                Qoldiq qo'shish
              </Menu.Item>
            )
          }

          {
            role === 'admin' && (
              <Menu.Item key="hodimlar" icon={<TeamOutlined />}>
                Hodimlar
              </Menu.Item>
            )
          }
          {
            role === 'admin' && (
              <Menu.Item key="oylik" icon={<DollarOutlined />}>
                Oylik hisobot
              </Menu.Item>
            )
          }
          <Menu.Item key="transportions" icon={<DollarOutlined />}>
           Tovar o'tkazish
          </Menu.Item>
        </Menu>

      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <Button type="primary" onClick={toggle} style={{ marginBottom: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
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
