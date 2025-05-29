import React, { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  InputNumber,
  Modal,
  Select,
  message,
} from "antd";
import {
  useCreateTransportionMutation,
  useGetGotTransportionsQuery,
  useGetSentTransportionsQuery,
} from "../../context/service/transportion.service";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";

const { TabPane } = Tabs;
const { Option } = Select;

const Transportion = () => {
  const { data: products = [] } = useGetProductsQuery();
  const { data: sentTransportions = [] } = useGetSentTransportionsQuery();
  const { data: gotTransportions = [] } = useGetGotTransportionsQuery();
  const [createTransportion] = useCreateTransportionMutation();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const [basket, setBasket] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toWarehouse, setToWarehouse] = useState(null);

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
                value < 1
                  ? 1
                  : value > item.quantity
                  ? item.quantity
                  : value,
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
      to_warehouse: toWarehouse,
      products: basket.map((item) => ({
        product_id: item._id,
        quantity: item.quantity,
        transport_fee_per_quantity: 0,
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
  ];

  console.log('hi');
  

  const transportionColumns = [
    {
      title: "Mahsulotlar",
      render: (_, record) =>
        record.products.map((p) => (
          <div key={p.product_id._id}>
            {p.product_id.name} - {p.quantity} dona
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
    { title: "Holati", dataIndex: "status" },
  ];

  return (
    <>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Jo‘natma yaratish" key="1">
          <h3>Mavjud mahsulotlar</h3>
          <Table
            rowKey="_id"
            columns={productColumns}
            dataSource={products}
            pagination={false}
          />

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
            onClick={() => setModalOpen(true)}
            disabled={basket.length === 0}
          >
            Jo‘natma yaratish
          </Button>

          <Modal
            title="Jo‘natma omborini tanlang"
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            onOk={handleCreateTransportion}
          >
            <Select
              placeholder="Omborni tanlang"
              style={{ width: "100%" }}
              onChange={(val) => setToWarehouse(val)}
            >
              {warehouses.map((wh) => (
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

        <TabPane tab="Qabul qilinganlar" key="3">
          <Table
            rowKey="_id"
            columns={transportionColumns}
            dataSource={gotTransportions}
          />
        </TabPane>
      </Tabs>
    </>
  );
};

export default Transportion;
