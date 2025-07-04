import React, { useState } from "react";
import { Table, Button, message, Modal, Input, Select } from "antd";
import {
  useGetAllDebtorsQuery,
  usePayDebtMutation,
} from "../../context/service/debt.service";
import { EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { FaChevronLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service";

const Debtors = () => {
  const { data: debtors = [] } = useGetAllDebtorsQuery();
  const { data: partnerProduct = [] } = useGetProductsPartnerQuery();
  const [payDebt] = usePayDebtMutation();
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const handlePayDebt = async (debtId) => {
    try {
      await payDebt({
        id: debtId,
        amount: paymentAmount,
        currency: selectedCurrency,
        type: paymentType,
      }).unwrap();
      setSelectedCurrency("");
      setPaymentAmount(null);
      message.success("Qarz muvaffaqiyatli to'landi");
      setIsModalVisible(false);
    } catch (error) {
      message.error("Qarz to'lashda xatolik yuz berdi");
    }
  };

  const debtorsColumn = [
    {
      title: "Mijoz ismi",
      render: (_, record) => {
        return (
          record.clientId?.name ||
          partnerProduct.find((p) => p.partner_number === record.partnerId)
            ?.name_partner
        );
      },
    },
    {
      title: "Telefon raqami",
      render: (_, record) =>
        record.clientId?.phone ||
        partnerProduct.find((p) => p.partner_number === record.partnerId)
          ?.partner_number,
    },
    {
      title: "Manzil",
      render: (_, record) =>
        record.clientId?.address ||
        partnerProduct.find((p) => p.partner_number === record.partnerId)
          ?.partner_address,
    },
    ...(role === "admin"
      ? [
          {
            title: "Tovar nomi",
            dataIndex: ["productId", "name"],
            key: "productId.name",
          },

          {
            title: "Sotish narxi",
            dataIndex: "sellingPrice",
            key: "sellingPrice",
            render: (value) => (value ? `${value?.toFixed(2)}` : "0.00"),
          },

          { title: "Soni", dataIndex: "quantity", key: "quantity" },
          {
            title: "Umumiy summa",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (text) => text.toFixed(2),
          },
        ]
      : []),
    {
      title: "Qoldiq summa",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: (text) => text?.toFixed(2),
    },
    {
      title: "Valyuta",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Qarz muddati",
      dataIndex: "dueDate",
      render: (text) => moment(text).format("DD.MM.YYYY"),
      key: "dueDate",
    },
    {
      title: "Holati",
      dataIndex: "status",
      key: "status",
      render: (status) => (status === "paid" ? "To'langan" : "To'lanmagan"),
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <div className="table_actions">
          {role === "store" && record?.status === "pending" && (
            <Button
              type="primary"
              onClick={() => {
                setSelectedDebtor(record);
                setIsModalVisible(true);
              }}
            >
              To'lash
            </Button>
          )}
          {role !== "store" && (
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDebtor(record);
                setIsHistoryModalVisible(true);
              }}
            >
              Tarix
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page" style={{ overflowX: "auto" }}>
      <div
        className="page_header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#fff",
          height: "40px",
          marginTop: "10px",
        }}
      >
        <h1 style={{ color: "#001529" }}>Qarzdorlar</h1>
        {role !== "admin" && (
          <Button onClick={() => navigate("/")} type="primary">
            <FaChevronLeft />
          </Button>
        )}
      </div>
      <Table
        columns={debtorsColumn}
        scroll={{ x: "max-content" }}
        dataSource={debtors}
        rowKey="_id"
      />
      <Modal
        title="Qarz to'lash"
        open={isModalVisible}
        onOk={() => handlePayDebt(selectedDebtor._id)}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          type="number"
          placeholder="To'lov miqdorini kiriting"
          step={0.001}
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
        <Select
          style={{ width: "100%", marginTop: "12px" }}
          type="text"
          placeholder="To'lov valyutasini tanlang"
          value={selectedCurrency}
          onChange={(value) => setSelectedCurrency(value)}
        >
          <Select.Option value="USD">USD</Select.Option>
          <Select.Option value="SUM">SUM</Select.Option>
        </Select>

        <Select
          style={{ width: "100%", marginTop: "12px" }}
          type="text"
          placeholder="To'lov usulini tanlang"
          value={paymentType}
          onChange={(value) => setPaymentType(value)}
        >
          <Select.Option value="naqt">Naqt</Select.Option>
          <Select.Option value="karta">Karta</Select.Option>
        </Select>
      </Modal>
      <Modal
        title="To'lovlar tarixi"
        visible={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
      >
        <Table
          columns={[
            {
              title: "To'lov miqdori",
              dataIndex: "amount",
              key: "amount",
            },
            {
              title: "Valyuta",
              dataIndex: "currency",
              key: "currency",
            },
            {
              title: "To'lov sanasi",
              dataIndex: "date",
              key: "date",
              render: (date) => new Date(date).toLocaleString(),
            },
            {
              title: "Do'kon",
              dataIndex: "storeId",
              render: (store) => store.name,
            },
          ]}
          dataSource={selectedDebtor ? selectedDebtor.paymentHistory : []}
          rowKey={(record) => record.date}
        />
      </Modal>
    </div>
  );
};

export default Debtors;
