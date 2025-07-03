import React, { useState } from "react";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service";
import {
  Card,
  Col,
  Row,
  Modal,
  Table,
  Typography,
  Space,
  Input,
  Select,
} from "antd";
import { MdScale } from "react-icons/md";
import "./partner.css";
import { useGetActPartnersQuery } from "../../context/service/act-partner.service";

const { Title, Text } = Typography;

const Partner = () => {
  const { data: hamkorMahsulotlari = [] } = useGetProductsPartnerQuery();
  const { data: partnersFromApi = [] } = useGetActPartnersQuery();
  const [tanlanganHamkor, setTanlanganHamkor] = useState(null);
  const [modalKoʻrinadi, setModalKoʻrinadi] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPartiya, setSelectedPartiya] = useState("");

  const unikalManzillar = Array.from(
    new Set(partnersFromApi.map((p) => p.partner_address).filter(Boolean))
  );

  const filtrlanganMahsulotlar = tanlanganHamkor
    ? hamkorMahsulotlari.filter((p) =>
        p.partner_number === tanlanganHamkor.partner_number && selectedPartiya
          ? p.part === selectedPartiya
          : true
      )
    : [];

  const ustunlar = [
    {
      title: "Mahsulot",
      dataIndex: "name",
      key: "name",
      render: (matn, yozuv) => (
        <Space direction="vertical" size="small">
          {yozuv.image_url ? (
            <img
              src={yozuv.image_url}
              alt={yozuv.name}
              className="card-product-image"
            />
          ) : (
            <div className="card-no-image">Rasm yoʻq</div>
          )}
          <Text>{yozuv.name || "Nomaʼlum"}</Text>
        </Space>
      ),
    },
    {
      title: "Kategoriya",
      dataIndex: "category",
    },
    { title: "Kod", dataIndex: "code", key: "code" },
    { title: "Oʻlcham", dataIndex: "size", key: "size" },
    {
      title: "Umumiy vazn (kg)",
      dataIndex: "total_kg",
      key: "total_kg",
      render: (matn) => (matn ? matn?.toFixed(2) : "-"),
    },
    // { title: "Dona soni", dataIndex: "quantity", key: "quantity" },
    {
      title: "Quti soni",
      dataIndex: "box_quantity",
      key: "box_quantity",
      render: (matn) => (matn ? matn?.toFixed(2) : "-"),
    },
    // {
    //   title: "Paket soni",
    //   key: "package_quantity",
    //   render: (_, yozuv) =>
    //     yozuv?.isPackage ? yozuv?.package_quantity?.toFixed(2) : "-",
    // },
    { title: "Valyuta", dataIndex: "currency", key: "currency" },
    {
      title: "Sotib olish narxi",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (matn, yozuv) => `${yozuv.purchasePrice?.value || "-"}`,
    },
    {
      title: "Sotish narxi",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (matn, yozuv) =>
        `${yozuv.sellingPrice?.value?.toFixed(2) || "-"}`,
    },
    {
      title: "Ombor",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (matn, yozuv) => yozuv?.warehouse?.name || "-",
    },
    // { title: "Shtrix kod", dataIndex: "barcode", key: "barcode" },
  ];

  const kartaBosish = (hamkor) => {
    setTanlanganHamkor(hamkor);
    setModalKoʻrinadi(true);
  };

  const modalYopish = () => {
    setModalKoʻrinadi(false);
    setTanlanganHamkor(null);
  };

  console.log(filtrlanganMahsulotlar);

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", overflowX: "auto" }}>
      <Title level={2} style={{ color: "#001529", marginBottom: "24px" }}>
        Yetkazib beruvchilar
      </Title>
      <Space style={{ marginBottom: "24px" }}>
        <Input
          style={{ width: "300px" }}
          placeholder="Ismini kiriting"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Input
          style={{ width: "200px" }}
          placeholder="Telefon raqam kiriting"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
        />
        <Select
          value={selectedAddress}
          onChange={(value) => setSelectedAddress(value)}
          placeholder={"Manzil bo'yicha saralash"}
          style={{ width: "200px" }}
        >
          <Select.Option value="">Barchasi</Select.Option>
          {unikalManzillar.map((manzil, indeks) => (
            <Select.Option key={indeks} value={manzil}>
              {manzil}
            </Select.Option>
          ))}
        </Select>
      </Space>
      <Row gutter={[16, 16]}>
        {partnersFromApi
          ?.filter((h) =>
            selectedAddress
              ? h.partner_address === selectedAddress
              : searchName
              ? h.partner_name
                  ?.toLowerCase()
                  .includes(searchName?.toLowerCase())
              : searchNumber
              ? h.partner_number
                  ?.toLowerCase()
                  .includes(searchNumber?.toLowerCase())
              : true
          )
          .map((hamkor, indeks) => (
            <Col xs={24} sm={12} md={8} lg={6} key={indeks}>
              <Card
                hoverable
                onClick={() => kartaBosish(hamkor)}
                style={{
                  background: "#fff",
                  border: `1px solid ${
                    tanlanganHamkor?.partner_name === hamkor.partner_name
                      ? "#001529"
                      : "#d9d9d9"
                  }`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                headStyle={{ background: "#001529", color: "#fff" }}
                title={hamkor.partner_name}
              >
                <Text>Raqam: {hamkor.partner_number}</Text>
              </Card>
            </Col>
          ))}
      </Row>
      <Modal
        title={
          <Space>
            <MdScale style={{ fontSize: "20px", color: "#001529" }} />
            <Text strong style={{ color: "#001529" }}>
              {tanlanganHamkor?.partner_name} - Mahsulotlar haqida maʼlumot
            </Text>
            <Select
              style={{ width: "200px" }}
              onChange={setSelectedPartiya}
              value={selectedPartiya}
            >
              <Select.Option value={""}>Barchasi</Select.Option>
              {tanlanganHamkor?.parts.map((p) => (
                <Select.Option value={p.part}>{p.part}</Select.Option>
              ))}
            </Select>
          </Space>
        }
        open={modalKoʻrinadi}
        onCancel={modalYopish}
        footer={null}
        width={1600}
        bodyStyle={{ padding: "16px" }}
      >
        <table style={{ border: "1px solid #000", padding: "5px" }}>
          <thead>
            <tr style={{ border: "1px solid #000", padding: "5px" }}>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                Umumiy karobka soni
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                Umumiy kg
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                Valyuta
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                Umumiy tan summasi
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                Umumiy sotish summasi
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                Umumiy foyda summasi
              </th>
            </tr>
          </thead>
          <tbody>
            {["USD", "SUM"].map((currency) => {
              const filtered = filtrlanganMahsulotlar.filter(
                (p) => p.currency === currency
              );
              const boxSum = filtered.reduce(
                (acc, p) => acc + p.box_quantity,
                0
              );
              const totalKg = filtered.reduce(
                (acc, p) => acc + p.total_kg,
                0
              );
              const purchaseSum = filtered.reduce(
                (acc, p) => acc + p.purchasePrice.value * p.quantity,
                0
              );
              const sellingSum = filtered.reduce(
                (acc, p) => acc + p.sellingPrice.value * p.quantity,
                0
              );
              const profitSum = sellingSum - purchaseSum;

              return (
                <tr key={currency}>
                  <td style={{ border: "1px solid #000", padding: "5px" }}>
                    {boxSum?.toLocaleString()} ta
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px" }}>
                    {totalKg?.toLocaleString()} kg
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px" }}>
                    {currency}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px" }}>
                    {purchaseSum?.toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px" }}>
                    {sellingSum?.toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px" }}>
                    {profitSum?.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Table
          columns={ustunlar}
          size="small"
          dataSource={filtrlanganMahsulotlar}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          style={{ border: "1px solid #f0f0f0" }}
        />
      </Modal>
    </div>
  );
};

export default Partner;
