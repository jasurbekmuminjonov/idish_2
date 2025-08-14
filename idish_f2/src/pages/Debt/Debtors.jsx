import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Input,
  Select,
  Popover,
  Tag,
} from "antd";
import {
  useGetAllDebtorsQuery,
  usePayDebtMutation,
} from "../../context/service/debt.service";
import { EyeOutlined, DollarOutlined } from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service";

const Debtors = () => {
  const { data: debtors = [] } = useGetAllDebtorsQuery();
  const { data: partnerProduct = [] } = useGetProductsPartnerQuery();
  const [payDebt] = usePayDebtMutation();
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [expandedRowKey, setExpandedRowKey] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [paymentType, setPaymentType] = useState("");

  // Guruhlash
  const groupedData = useMemo(() => {
    const map = new Map();

    debtors.forEach((debtor) => {
      const clientName = debtor.clientId?.name || null;
      const partnerName =
        partnerProduct.find((p) => p.partner_number === debtor.partnerId)
          ?.name_partner || null;

      if (!clientName && !partnerName) return; // null bo‘lsa groupga qo‘shmaymiz

      const groupKey = clientName || partnerName;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          qarzdor: groupKey,
          totalAmount: 0,
          remainingAmount: 0,
          children: [],
        });
      }

      const group = map.get(groupKey);
      group.totalAmount += debtor.totalAmount || 0;
      group.remainingAmount += debtor.remainingAmount || 0;
      group.children.push(debtor);
    });

    return Array.from(map.values());
  }, [debtors, partnerProduct]);

  const handlePayDebt = async () => {
    if (!selectedDebtor || !paymentAmount || !selectedCurrency || !paymentType)
      return message.warning("Barcha maydonlarni to‘ldiring!");

    try {
      await payDebt({
        id: selectedDebtor._id,
        amount: Number(paymentAmount),
        currency: selectedCurrency,
        type: paymentType,
      }).unwrap();

      message.success("Qarz muvaffaqiyatli to'landi");
      setIsModalVisible(false);
      setSelectedDebtor(null);
      setPaymentAmount("");
      setSelectedCurrency("");
      setPaymentType("");
    } catch (error) {
      message.error("To‘lovda xatolik yuz berdi");
    }
  };

  // Asosiy (general) columnlar
  const generalColumns = [
    {
      title: "Qarzdor",
      dataIndex: "qarzdor",
    },
    {
      title: "Umumiy summa",
      dataIndex: "totalAmount",
      render: (v) => v.toFixed(2),
    },
    {
      title: "Qoldiq",
      dataIndex: "remainingAmount",
      render: (v) => v.toFixed(2),
    },
  ];

  // Har bir guruh expand qilinganda chiqadigan asosiy debt columns
  const debtColumns = [
    {
      title: "Qarzdor",
      render: (_, record) =>
        record.clientId?.name ||
        partnerProduct.find((p) => p.partner_number === record.partnerId)
          ?.name_partner,
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD.MM.YYYY"),
    },
    {
      title: "Umumiy summa",
      dataIndex: "totalAmount",
      render: (val) => `${val?.toFixed(2)} USD`,
    },
    {
      title: "Qoldiq",
      dataIndex: "remainingAmount",
      render: (val) => `${val?.toFixed(2)} USD`,
    },
    {
      title: "Holat",
      dataIndex: "status",
      render: (status) =>
        status === "paid" ? (
          <Tag color="green">To‘langan</Tag>
        ) : (
          <Tag color="red">To‘lanmagan</Tag>
        ),
    },
    {
      title: "Tarix",
      render: (_, record) => (
        <Popover
          title="To‘lovlar tarixi"
          content={
            <div>
              {record.paymentHistory.map((h, i) => (
                <div key={i}>
                  {moment(h.date).format("DD.MM.YYYY")} - {h.amount.toFixed(2)}{" "}
                  {h.currency}
                </div>
              ))}
            </div>
          }
          trigger="click"
        >
          <Button size="small" icon={<EyeOutlined />} />
        </Popover>
      ),
    },
    {
      title: "Amal",
      render: (_, record) =>
        record.status === "pending" && role === "store" ? (
          <Button
            icon={<DollarOutlined />}
            onClick={() => {
              setSelectedDebtor(record);
              setIsModalVisible(true);
            }}
          >
            To‘lash
          </Button>
        ) : null,
    },
  ];

  const productCols = [
    {
      title: "Tovar nomi",
      dataIndex: ["productId", "name"],
    },
    {
      title: "Soni",
      dataIndex: "quantity",
    },
    {
      title: "Narx",
      dataIndex: "sellingPrice",
      render: (v) => `${v.toFixed(2)}`,
    },
    {
      title: "Jami",
      dataIndex: "totalAmount",
      render: (v) => `${v.toFixed(2)}`,
    },
    {
      title: "Valyuta",
      dataIndex: "currency",
    },
    {
      title: "Birlik",
      render: () => "Dona",
    },
  ];

  return (
    <div className="page">
      <div className="page_header">
        <h2>Qarzdorlar</h2>
        {role !== "admin" && (
          <Button onClick={() => navigate("/")} type="primary">
            Orqaga
          </Button>
        )}
      </div>

      <Table
        rowKey="key"
        dataSource={groupedData}
        columns={generalColumns}
        expandable={{
          expandedRowRender: (group) => (
            <Table
              rowKey="_id"
              columns={debtColumns}
              dataSource={group.children}
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    columns={productCols}
                    dataSource={record.products}
                    pagination={false}
                    rowKey={(r) => r.productId._id}
                  />
                ),
              }}
            />
          ),
        }}
      />

      <Modal
        title="Qarz to‘lash"
        open={isModalVisible}
        onOk={handlePayDebt}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          type="number"
          placeholder="To‘lov miqdori"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
        <Select
          value={selectedCurrency}
          onChange={setSelectedCurrency}
          placeholder="Valyuta"
          style={{ width: "100%", marginTop: 12 }}
        >
          <Select.Option value="USD">USD</Select.Option>
          <Select.Option value="SUM">SUM</Select.Option>
          <Select.Option value="KYG">KYG</Select.Option>
        </Select>

        <Select
          value={paymentType}
          onChange={setPaymentType}
          placeholder="To‘lov usuli"
          style={{ width: "100%", marginTop: 12 }}
        >
          <Select.Option value="naqt">Naqt</Select.Option>
          <Select.Option value="karta">Karta</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

export default Debtors;
