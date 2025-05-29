import React, { useState, useEffect } from "react";
import { Tabs, Table, Button, InputNumber, Modal, Select, message } from "antd";
import {
  useCreateTransportionMutation,
  useGetSentTransportionsQuery,
  useAcceptTransportionMutation,
  useCencelTransportionMutation,
} from "../../context/service/transportion.service";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons"; // yu
import "./transportion.css";

const { TabPane } = Tabs;
const { Option } = Select;

const Transportion = () => {
  const { data: products = [] } = useGetProductsQuery();
  const { data: sentTransportions = [] } = useGetSentTransportionsQuery();
  const [createTransportion] = useCreateTransportionMutation();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const [acceptTransportion] = useAcceptTransportionMutation();
  const [cencelTransportion] = useCencelTransportionMutation();

  const [basket, setBasket] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toWarehouse, setToWarehouse] = useState(null);
  const [fromWarehouse, setFromWarehouse] = useState(null);

  // Add product to basket
  const handleAddToBasket = (product) => {
    if (!basket.find((item) => item._id === product._id)) {
      setBasket([...basket, { ...product, quantity: 1 }]);
    } else {
      message.warning("Bu mahsulot allaqachon qo‘shilgan");
    }
  };

  // Update quantity
  const updateQuantity = (productId, value) => {
    setBasket((prev) =>
      prev.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity:
                value < 1 ? 1 : value > item.quantity ? item.quantity : value,
            }
          : item
      )
    );
  };

  // Create transportion
  const handleCreateTransportion = async () => {
    if (!toWarehouse) {
      return message.error("Ombor tanlanmagan");
    }
    if (basket.length === 0) {
      return message.error("Savatchada mahsulot yo‘q");
    }

    const payload = {
      from_warehouse: fromWarehouse,
      to_warehouse: toWarehouse,
      products: basket.map((item) => ({
        product_id: item._id,
        quantity: item.quantity,
        unit: item.unit,
      })),
    };
    try {
      await createTransportion(payload).unwrap();
      message.success("Jo‘natma yaratildi");
      setBasket([]);
      setModalOpen(false);
    } catch (err) {
      message.error("Xatolik yuz berdi");
    }
  };

  const productColumns = [
    { title: "Nomi", dataIndex: "name" },
    { title: "Soni", dataIndex: "quantity" },
    {
      title: "Amal",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleAddToBasket(record)}>
          Qo‘shish
        </Button>
      ),
    },
  ];

  const updateUnit = (productId, value) => {
    setBasket((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, unit: value } : item
      )
    );
  };
  const basketColumns = [
    { title: "Nomi", dataIndex: "name" },
    {
      title: "Soni",
      dataIndex: "quantity",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.quantity}
          value={record.quantity}
          onChange={(val) => updateQuantity(record._id, val)}
        />
      ),
    },
    {
      title: "Birlik",
      render: (_, item) => (
        <Select
          value={item.unit}
          onChange={(val) => updateUnit(item._id, val)}
          style={{ width: "100px" }}
        >
          {item.isPackage && <Option value="package_quantity">Pachka</Option>}
          <Option value="box_quantity">Karobka</Option>
          <Option value="quantity">Dona</Option>
        </Select>
      ),
    },
  ];

  const acceptData = async (id) => {
    try {
      await acceptTransportion(id).unwrap();
      message.success("Jo‘natma qabul qilindi");
    } catch (err) {
      message.error("Xatolik yuz berdi");
    }
  };
  const cencelData = async (id) => {
    try {
      await cencelTransportion(id).unwrap();
      message.success("Jo‘natma bekor qilindi");
    } catch (err) {
      message.error("Xatolik yuz berdi");
    }
  };
  const statusTexts = {
    quantity: "dona",
    box_quantity: "quti",
    package_quantity: "pachka",
  };
  const transportionColumns = [
    {
      title: "Mahsulotlar",
      render: (_, record) =>
        record.products.map((p) => (
          <div key={p.product_id._id}>
            {p.product_id.name} - {p.quantity} {statusTexts[p.unit]}
          </div>
        )),
    },
    {
      title: "Jo‘natuvchi",
      dataIndex: "from_warehouse",
      render: (val) => val?.name || "-",
    },
    {
      title: "Qabul qiluvchi",
      dataIndex: "to_warehouse",
      render: (val) => val?.name || "-",
    },
    {
      title: "Holati",
      dataIndex: "status",
      render: (val) =>
        val === "in_process"
          ? "Jarayonda"
          : val === "delivered"
          ? "Yetkazib berildi"
          : val === "cancelled"
          ? "Bekor qilindi"
          : val,
    },
    {
      title: "Amal",
      render: (_, item) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            onClick={() => acceptData(item._id)}
            icon={<CheckOutlined />}
            type="primary"
          />
          <Button
            onClick={() => cencelData(item._id)}
            icon={<CloseOutlined />}
            danger
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Jo‘natma yaratish" key="1">
          <div className="transportion">
            <div>
              <h3>Qaysi ombordan</h3>
              <Select
                placeholder="Omborni tanlang"
                style={{ width: "100%" }}
                value={fromWarehouse} // <-- Qo‘shildi
                onChange={(val) => setFromWarehouse(val)}
              >
                {warehouses.map((wh) => (
                  <Option key={wh._id} value={wh._id}>
                    {wh.name}
                  </Option>
                ))}
              </Select>

              <h3>Mavjud mahsulotlar</h3>
              <Table
                rowKey="_id"
                columns={productColumns}
                dataSource={products.filter(
                  (p) => p.warehouse._id === fromWarehouse
                )}
                pagination={false}
              />
            </div>

            <div>
              <h3 className="mt-4">Savatcha</h3>
              <Table
                rowKey="_id"
                columns={basketColumns}
                dataSource={basket}
                pagination={false}
              />

              <Button
                type="primary"
                className="mt-3"
                onClick={() => {
                  if (!fromWarehouse) {
                    return message.error("Ombor tanlanmagan");
                  }
                  setModalOpen(true);
                }}
                disabled={basket.length === 0}
              >
                Jo‘natma yaratish
              </Button>
            </div>
          </div>

          <Modal
            title="Qaysi omborga"
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            onOk={handleCreateTransportion}
          >
            <Select
              placeholder="Omborni tanlang"
              style={{ width: "100%" }}
              onChange={(val) => setToWarehouse(val)}
            >
              {warehouses
                .filter((wh) => wh._id !== fromWarehouse)
                .map((wh) => (
                  <Option key={wh._id} value={wh._id}>
                    {wh.name}
                  </Option>
                ))}
            </Select>
          </Modal>
        </TabPane>

        <TabPane tab="Yuborilganlar" key="2">
          <Table
            rowKey="_id"
            columns={transportionColumns}
            dataSource={sentTransportions}
          />
        </TabPane>
      </Tabs>
    </>
  );
};

export default Transportion;
