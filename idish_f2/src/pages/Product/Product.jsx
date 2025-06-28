import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  message,
  Popconfirm,
  Upload,
  Switch,
  Space,
  AutoComplete,
  Card,
  Col,
  Row,
  Checkbox,
} from "antd";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import {
  useAddProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../../context/service/product.service";
import {
  useGetProductsPartnerQuery,
  useDeleteProductPartnerMutation,
  useUpdateProductPartnerMutation,
} from "../../context/service/partner.service";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";
import { MdEdit, MdDeleteForever, MdPrint } from "react-icons/md";
import axios from "axios";
import { FaPlus, FaUpload } from "react-icons/fa";
import "./product.css";
import {
  useCreateActPartnerMutation,
  useGetActPartnersQuery,
  useUpdateActPartnerMutation,
} from "../../context/service/act-partner.service";

const { Option } = Select;

const generateBarcode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const BarcodePrint = React.forwardRef(({ barcode }, ref) => (
  <div ref={ref} style={{ width: "4cm", height: "3cm" }}>
    <Barcode value={barcode} width={1.5} height={50} fontSize={10} />
  </div>
));

const Product = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [editingProduct, setEditingProduct] = useState("");
  const [editingSource, setEditingSource] = useState("");
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsQuery();
  const { data: partnerProducts = [], isLoading: partnerProductsLoading } =
    useGetProductsPartnerQuery();
  const { data: warehouses = [], isLoading: warehousesLoading } =
    useGetWarehousesQuery();
  const [addProduct] = useAddProductMutation();
  const { data: partnersFromApi = [], isLoading: partnersLoading } =
    useGetActPartnersQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [deleteProductPartner] = useDeleteProductPartnerMutation();
  const [editProduct] = useUpdateProductMutation();
  const [editProductPartner] = useUpdateProductPartnerMutation();
  const [currentBarcode, setCurrentBarcode] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isPackage, setIsPackage] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");

  const [nameOptions, setNameOptions] = useState([]);
  const [numberOptions, setNumberOptions] = useState([]);

  const [partnerModal, setParnerModal] = useState(false);
  const [partnerFormModal, setPartnerFormModal] = useState(false);
  const [partnerForm] = Form.useForm();
  const [createPartner] = useCreateActPartnerMutation();
  const [editPartner] = useUpdateActPartnerMutation();
  const [editingPartner, setEditingPartner] = useState(null);

  async function handleAddPartner(values) {
    try {
      if (!editingPartner) {
        await createPartner(values);
        message.success("Hamkor qo'shildi");
      } else {
        await editPartner({ id: editingPartner, body: values });
        message.success("Hamkor tahrirlandi");
      }
      setPartnerFormModal(false);
      setEditingPartner(null);
      partnerForm.resetFields();
    } catch (err) {
      console.log(err);
    }
  }

  const handleNameSearch = (value) => {
    const filtered = unikalHamkorlar
      .filter(
        (h) =>
          h.nom.toLowerCase().includes(value.toLowerCase()) ||
          h.raqam.toLowerCase().includes(value.toLowerCase())
      )
      .map((h) => ({
        value: h.nom,
        label: `${h.nom} (${h.raqam})`,
      }));

    setNameOptions(filtered);
  };

  const handleNumberSearch = (value) => {
    const filtered = unikalHamkorlar
      .filter(
        (h) =>
          h.raqam.toLowerCase().includes(value.toLowerCase()) ||
          h.nom.toLowerCase().includes(value.toLowerCase())
      )
      .map((h) => ({
        value: h.raqam,
        label: `${h.raqam} (${h.nom})`,
      }));

    setNumberOptions(filtered);
  };

  const handleNameSelect = (value, form) => {
    const selected = unikalHamkorlar.find((h) => h.nom === value);
    if (selected) {
      form.setFieldValue("partner_number", selected.raqam); // Set number when name is selected
      form.setFieldValue("partner_address", selected.manzil);
    }
  };

  // Handle number selection
  const handleNumberSelect = (value, form) => {
    const selected = unikalHamkorlar.find((h) => h.raqam === value);
    if (selected) {
      form.setFieldValue("name_partner", selected.nom); // Set name when number is selected
      form.setFieldValue("partner_address", selected.manzil);
    }
  };

  const allProducts = [
    ...products.map((product) => ({
      ...product,
      source: "product",
      name: product.name || "Noma'lum",
      barcode: product.barcode || "",
      name_partner: product.name_partner || "",
      partner_number: product.partner_number || "",
    })),
    // ...partnerProducts.map((product) => ({
    //   ...product,
    //   source: "partner",
    //   name: product.name || "Noma'lum",
    //   barcode: product.barcode || "",
    //   name_partner: product.name_partner || "",
    //   partner_number: product.partner_number || "",
    // })),
  ];

  const barchaMahsulotlar = [
    ...products.map((mahsulot) => ({
      ...mahsulot,
      manba: "mahsulot",
      hamkor_nomi: mahsulot.name_partner || "",
      hamkor_raqami: mahsulot.partner_number || "",
      hamkor_manzili: mahsulot.partner_address || "",
    })),
    ...partnerProducts.map((mahsulot) => ({
      ...mahsulot,
      manba: "hamkor",
      hamkor_nomi: mahsulot.name_partner || "",
      hamkor_raqami: mahsulot.partner_number || "",
      hamkor_manzili: mahsulot.partner_address || "",
    })),
    // ...partnersFromApi.map((partner) => ({
    //   manba: "api",
    //   hamkor_nomi: partner.partner_name || "",
    //   hamkor_raqami: partner.partner_number || "",
    //   hamkor_manzili: partner.partner_address || "",
    // })),
  ];

  const unikalHamkorlar = Array.from(
    new Map(
      barchaMahsulotlar
        .filter((p) => p.hamkor_nomi && p.hamkor_raqami)
        .map((p) => [
          p.hamkor_nomi,
          {
            nom: p.hamkor_nomi,
            raqam: p.hamkor_raqami,
            manzil: p.hamkor_manzili,
          },
        ])
    ).values()
  );

  const unikalManzillar = Array.from(
    new Set(barchaMahsulotlar.map((p) => p.hamkor_manzili).filter(Boolean))
  );

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "65384e0beb6c45b817d791e806199b7e");

    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData
      );
      const url = response.data.data.url;
      setImageUrl(url);
      message.success("Rasm muvaffaqiyatli yuklandi!");
    } catch (error) {
      console.error("Yuklashda xatolik:", error);
      message.error("Rasmni yuklashda xatolik yuz berdi.");
    }
  };

  const printRef = useRef();

  useEffect(() => {
    if (currentBarcode) {
      handlePrint();
    }
  }, [currentBarcode]);

  const handleAddProduct = () => {
    setModalVisible(true);
    setEditingSource("product");
  };

  const handleCancel = () => {
    setModalVisible(false);
    setImageUrl("");
    setEditingSource("");
    form.resetFields();
  };

  const handleImageModalCancel = () => {
    setImageModalVisible(false);
    setSelectedImage("");
  };

  const onFinish = async (values) => {
    try {
      const partnerData = partnersFromApi.find(
        (p) => p.partner_number === localStorage.getItem("selectedPartner")
      );
      values.name_partner = partnerData.partner_name;
      values.partner_number = partnerData.partner_number;
      values.partner_address = partnerData.partner_address;
      values.part = localStorage.getItem("selectedPartiya");
      if (localStorage.getItem("role") === "warehouse") {
        values.warehouse = localStorage.getItem("_id");
      }
      if (!editingProduct) {
        const newBarcode = generateBarcode();
        setCurrentBarcode(newBarcode);
        values.barcode = newBarcode;
        values.isPackage = isPackage;
      }
      values.image_url = imageUrl || "";

      if (values.total_kg) {
        const total_kg = Number(values.total_kg)?.toFixed(2);
        values.kg_per_box = values.box_quantity
          ? (total_kg / Number(values.box_quantity))?.toFixed(2)
          : null;
        values.kg_per_package =
          isPackage && values.package_quantity
            ? (total_kg / Number(values.package_quantity))?.toFixed(2)
            : null;
        values.kg_per_quantity = values.quantity
          ? (total_kg / Number(values.quantity))?.toFixed(2)
          : null;
      }

      if (editingProduct) {
        if (editingSource === "product") {
          await editProduct({
            id: editingProduct,
            data: values,
          }).unwrap();
          message.success("Mahsulot muvaffaqiyatli tahrirlandi!");
        } else if (editingSource === "partner") {
          await editProductPartner({
            id: editingProduct,
            data: values,
          }).unwrap();
          message.success("Mahsulot muvaffaqiyatli tahrirlandi!");
        }
      } else {
        await addProduct(values).unwrap();
        message.success("Mahsulot muvaffaqiyatli qo'shildi!");
      }
      form.resetFields();
      setEditingProduct("");
      setEditingSource("");
      setModalVisible(false);
      setImageUrl("");
    } catch (error) {
      if (
        error.data?.message?.includes("E11000 duplicate key error collection")
      ) {
        message.error("Barcode must be unique");
      } else {
        message.error("Mahsulotni qo'shishda xatolik yuz berdi!");
        console.error("Error:", error);
      }
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setCurrentBarcode(""),
  });

  const handleDelete = async (id, source) => {
    if (source === "product") {
      await deleteProduct(id);
    } else if (source === "partner") {
      await deleteProductPartner(id);
    }
  };

  const columns = [
    {
      title: "Tovar",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {record.image_url ? (
            <img
              src={record.image_url}
              alt={record.name}
              className="table-product-image"
              onClick={() => {
                setSelectedImage(record.image_url);
                setImageModalVisible(true);
              }}
            />
          ) : (
            <div
              className="table-no-image"
              onClick={() => {
                setSelectedImage("");
                setImageModalVisible(true);
              }}
            >
              -
            </div>
          )}
          <span>{record.name}</span>
        </div>
      ),
      width: 200,
    },
    {
      title: "Kategoriya",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Kod",
      dataIndex: "code",
      key: "code",
      width: 80,
    },
    {
      title: "O'lcham",
      dataIndex: "size",
      key: "size",
      width: 80,
    },
    {
      title: "Pachka",
      key: "package_quantity",
      render: (_, record) =>
        record?.isPackage ? record?.package_quantity?.toFixed(2) || "-" : "-",
      align: "center",
      width: 80,
    },
    {
      title: "Karobka",
      dataIndex: "box_quantity",
      key: "box_quantity",
      render: (text) => (text ? text?.toFixed(2) : "-"),
      align: "center",
      width: 80,
    },
    {
      title: "Valyuta",
      dataIndex: "currency",
      key: "currency",
      width: 80,
    },
    {
      title: "Sotish",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (text, record) => `${record.sellingPrice?.value || "-"}`,
      align: "center",
      width: 100,
    },
    {
      title: "Ombor",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (text, record) => record?.warehouse?.name || "-",
      width: 120,
    },
    // {
    //   title: "Xamkor",
    //   dataIndex: "name_partner",
    //   key: "name_partner",
    //   render: (text) => text || "-",
    //   width: 120,
    // },
    // {
    //   title: "Raqam",
    //   dataIndex: "partner_number",
    //   key: "partner_number",
    //   render: (text) => text || "-",
    //   width: 100,
    // },
    // {
    //   title: "Vazn (kg)",
    //   dataIndex: "total_kg",
    //   key: "total_kg",
    //   render: (text) => (text ? text?.toFixed(2) : "-"),
    //   align: "center",
    //   width: 80,
    // },
    // {
    //   title: "Dona",
    //   dataIndex: "quantity",
    //   key: "quantity",
    //   align: "center",
    //   width: 60,
    // },
    // {
    //   title: "Tan narxi",
    //   dataIndex: "purchasePrice",
    //   key: "purchasePrice",
    //   render: (text, record) => `${record.purchasePrice?.value || "-"}`,
    //   align: "center",
    //   width: 100,
    // },

    // {
    //   title: "Shtrix",
    //   dataIndex: "barcode",
    //   key: "barcode",
    //   width: 100,
    // },

    ...(localStorage.getItem("role") !== "warehouse"
      ? [
          {
            title: "Amallar",
            render: (_, record) => (
              <Space direction="horizontal" size={4}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setEditingProduct(record._id);
                    setEditingSource(record.source);
                    form.setFieldsValue({
                      ...record,
                      package_quantity: record.package_quantity?.toFixed(2),
                      box_quantity: record.box_quantity?.toFixed(2),
                    });
                    setImageUrl(record.image_url);
                    setModalVisible(true);
                  }}
                >
                  <MdEdit />
                </Button>
                <Popconfirm
                  title="O'chirishni tasdiqlaysizmi?"
                  onConfirm={() => handleDelete(record._id, record.source)}
                  okText="Ha"
                  cancelText="Yo'q"
                >
                  <Button
                    type="link"
                    size="small"
                    danger
                    style={{ color: "red" }}
                  >
                    <MdDeleteForever />
                  </Button>
                </Popconfirm>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setCurrentBarcode(record.barcode)}
                >
                  <MdPrint />
                </Button>
              </Space>
            ),
            align: "center",
            width: 100,
          },
        ]
      : []),
  ];

  const filteredProducts = allProducts.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const barcode = (product.barcode || "").toLowerCase();
    const searchNameLower = searchName.toLowerCase();
    const searchBarcodeLower = searchBarcode.toLowerCase();

    return (
      (searchName ? name.includes(searchNameLower) : true) &&
      (searchBarcode ? barcode.includes(searchBarcodeLower) : true)
    );
  });

  return (
    <div className="product-container">
      <div className="page_header">
        <Space>
          {localStorage.getItem("role") === "admin" && (
            <Button
              disabled={
                !localStorage.getItem("selectedPartner") ||
                !localStorage.getItem("selectedPartiya")
              }
              type="primary"
              onClick={handleAddProduct}
              size="small"
            >
              Tovar qo'shish
            </Button>
          )}
          <Input
            placeholder="Tovar nomi"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            size="small"
            style={{ width: 150 }}
          />
          <Input
            placeholder="Shtrix kod"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            size="small"
            style={{ width: 150 }}
          />
          <Button onClick={() => setPartnerFormModal(true)} type="primary">
            Hamkor qo'shish
          </Button>
          <Button onClick={() => setParnerModal(true)} type="primary">
            Hamkorlar
          </Button>
          <Space style={{ alignItems: "start" }} direction="vertical">
            <p>
              <strong>Tanlangan hamkor:</strong>{" "}
              {partnersFromApi?.find(
                (p) =>
                  p.partner_number === localStorage.getItem("selectedPartner")
              )?.partner_name || ""}
            </p>
            <p>
              <strong>Tanlangan partiya:</strong>{" "}
              {localStorage.getItem("selectedPartiya") || ""}
            </p>
          </Space>
        </Space>
        <div className="stats">
          <p>
            Umumiy dona:{" "}
            {allProducts?.reduce((a, b) => a + (b.quantity || 0), 0)}
          </p>
          <p>
            Umumiy Karobka:{" "}
            {allProducts
              ?.reduce((a, b) => a + (b.box_quantity || 0), 0)
              ?.toFixed(2)}
          </p>
        </div>
      </div>
      <Table
        className="product-table"
        columns={columns}
        dataSource={
          localStorage.getItem("role") === "warehouse"
            ? filteredProducts
                .filter((p) => p.warehouse._id === localStorage.getItem("_id"))
                .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
            : filteredProducts.sort(
                (a, b) => (a.quantity || 0) - (b.quantity || 0)
              )
        }
        loading={productsLoading || partnerProductsLoading}
        rowKey="_id"
        size="small"
        pagination={false}
        scroll={{ x: "max-content" }}
        rowClassName={(record) => {
          if (record.quantity < 30) return "row-danger";
          if (record.quantity >= 30 && record.quantity <= 50)
            return "row-warning";
          return "";
        }}
        bordered
      />
      <Modal
        title={editingProduct ? "Tovar tahrirlash" : "Tovar qo'shish"}
        visible={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          autoComplete="off"
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="product-form"
        >
          <Form.Item
            name="name"
            label="Tovar nomi"
            rules={[{ required: true, message: "Tovar nomini kiriting!" }]}
          >
            <AutoComplete
              placeholder="Tovar nomi"
              options={allProducts.map((product) => ({
                value: product.name,
              }))}
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().includes(inputValue.toLowerCase())
              }
            >
              <Input />
            </AutoComplete>
          </Form.Item>
          {/* <Form.Item name="name_partner" label="Xamkor ismi">
            <AutoComplete
              options={nameOptions}
              onSearch={(value) => handleNameSearch(value, form)}
              onSelect={(value) => handleNameSelect(value, form)}
              value={form.getFieldValue("name_partner")}
              placeholder="Xamkor ismi"
              filterOption={false}
            >
              <Input />
            </AutoComplete>
          </Form.Item>
          <Form.Item name="partner_number" label="Xamkor raqami">
            <AutoComplete
              options={numberOptions}
              onSearch={(value) => handleNumberSearch(value, form)}
              onSelect={(value) => handleNumberSelect(value, form)}
              value={form.getFieldValue("partner_number")}
              placeholder="Xamkor raqami"
              filterOption={false}
            >
              <Input />
            </AutoComplete>
          </Form.Item>
          <Form.Item name="partner_address" label="Hamkor manzili">
            <AutoComplete
              allowClear
              options={unikalManzillar.map((address) => ({
                value: address,
              }))}
              placeholder="Hamkor manzilini tanlang yoki yozing"
              filterOption={(inputValue, option) =>
                option?.value?.toLowerCase().includes(inputValue.toLowerCase())
              }
            >
              <Input />
            </AutoComplete>
          </Form.Item> */}
          <Form.Item name="size" label="O'lcham">
            <Input placeholder="O'lcham" type="text" />
          </Form.Item>
          <Form.Item name="code" label="Kod">
            <Input placeholder="Kod" type="text" />
          </Form.Item>
          <Form.Item label="Tan narxi" name={["purchasePrice", "value"]}>
            <Input placeholder="Tan narxi" type="number" />
          </Form.Item>
          <Form.Item label="Sotish narxi" name={["sellingPrice", "value"]}>
            <Input placeholder="Sotish narxi" type="number" />
          </Form.Item>
          <Form.Item label="Umumiy vazn" name="total_kg">
            <Input placeholder="Umumiy vazn (kg)" type="number" />
          </Form.Item>
          <Form.Item label="Dona" name="quantity">
            <Input placeholder="Dona miqdori" type="number" />
          </Form.Item>
          <Form.Item label="Pachka" name="package_quantity">
            <Input
              disabled={!isPackage}
              placeholder="Pachka miqdori"
              type="number"
            />
          </Form.Item>
          <Form.Item label="1 pachkadagi dona" name="quantity_per_package">
            <Input
              disabled={!isPackage}
              placeholder="1 pachkadagi dona"
              type="number"
            />
          </Form.Item>
          <Form.Item label="Karobka" name="box_quantity">
            <Input placeholder="Karobka miqdori" type="number" />
          </Form.Item>
          <Form.Item
            label={`1 karobkadagi ${isPackage ? "pachka" : "dona"}`}
            name="package_quantity_per_box"
          >
            <Input
              placeholder={`1 karobkadagi ${isPackage ? "pachka" : "dona"}`}
              type="number"
            />
          </Form.Item>
          <div className="product-switch">
            <span>Karobka → Dona</span>
            <Switch
              checked={isPackage}
              onChange={(checked) => setIsPackage(checked)}
            />
            <span>Karobka → Pachka → Dona</span>
          </div>
          <Form.Item label="Valyuta" name="currency">
            <Select placeholder="Valyuta tanlash">
              <Option value="">Keyin kiritish</Option>
              <Option value="USD">USD</Option>
              <Option value="SUM">SUM</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Ombor" name="warehouse">
            <Select
              disabled={localStorage.getItem("role") === "warehouse"}
              defaultValue={
                localStorage.getItem("role") === "warehouse"
                  ? localStorage.getItem("_id")
                  : null
              }
              placeholder="Ombor tanlash"
              loading={warehousesLoading}
            >
              {warehouses.map((warehouse) => (
                <Option key={warehouse._id} value={warehouse._id}>
                  {warehouse?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Kategoriya" name="category">
            <Input placeholder="Kategoriya" />
          </Form.Item>
          {/* <Form.Item label="Partiya " name="part">
            <Input placeholder="Partiya" />
          </Form.Item> */}
          <Form.Item label="Barkod" name="barcode" hidden>
            <Input />
          </Form.Item>
          <Upload
            customRequest={({ file }) => handleUpload(file)}
            showUploadList={false}
          >
            <Button>
              <FaUpload /> Rasm yuklash
            </Button>
          </Upload>
          {imageUrl && (
            <div className="product-upload-preview">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="product-upload-image"
              />
              <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                Rasm URL
              </a>
            </div>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? "Tahrirlash" : "Qo'shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Tovar rasmi"
        visible={imageModalVisible}
        onCancel={handleImageModalCancel}
        footer={null}
        className="modal__image"
      >
        {selectedImage ? (
          <img src={selectedImage} alt="Enlarged" className="enlarged-image" />
        ) : (
          <div className="no-image-placeholder">Rasm yo'q</div>
        )}
      </Modal>
      <Modal
        open={partnerFormModal}
        onCancel={() => {
          setPartnerFormModal(false);
          partnerForm.resetFields();
        }}
        title={editingPartner ? "Hamkorni tahrirlash" : "Hamkor qo'shish"}
        footer={null}
      >
        <Form form={partnerForm} layout="vertical" onFinish={handleAddPartner}>
          <Form.Item
            label="Hamkor nomi"
            name="partner_name"
            rules={[{ required: true, message: "Iltimos, nomini kiriting" }]}
          >
            <Input placeholder="Hamkor nomini kiriting" />
          </Form.Item>

          <Form.Item
            label="Hamkor raqami"
            name="partner_number"
            rules={[{ required: true, message: "Iltimos, raqamini kiriting" }]}
          >
            <Input placeholder="Hamkor raqamini kiriting" />
          </Form.Item>

          <Form.Item label="Hamkor manzili" name="partner_address">
            <Input placeholder="Manzil (ixtiyoriy)" />
          </Form.Item>

          <Form.List name="parts">
            {(fields, { add, remove }) => (
              <>
                <label>Partiyalar</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: "Qism nomini kiriting" },
                      ]}
                    >
                      <Input placeholder="Partiya" />
                    </Form.Item>
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<FaPlus />}
                    block
                  >
                    Partiya qo‘shish
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={partnerModal}
        footer={null}
        title="Hamkorlar"
        onCancel={() => setParnerModal(false)}
      >
        <Row gutter={[16, 16]}>
          {partnersFromApi.map((partner) => {
            const selectedPartner = localStorage.getItem("selectedPartner");
            const selectedPartiya = localStorage.getItem("selectedPartiya");
            const isChecked = partner.partner_number === selectedPartner;

            return (
              <Col span={24} key={partner.partner_number}>
                <Card
                  title={partner.partner_name}
                  extra={
                    <Space>
                      <Button
                        onClick={() => {
                          setEditingPartner(partner._id);
                          partnerForm.setFieldsValue({
                            partner_name: partner.partner_name,
                            partner_number: partner.partner_number,
                            partner_address: partner.partner_address,
                            parts: partner.parts,
                          });
                          setPartnerFormModal(true);
                        }}
                        type="primary"
                      >
                        <MdEdit />
                      </Button>
                      <Checkbox
                        defaultChecked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            localStorage.setItem(
                              "selectedPartner",
                              partner.partner_number
                            );
                            localStorage.setItem("selectedPartiya", "");
                          } else {
                            localStorage.removeItem("selectedPartner");
                            localStorage.setItem("selectedPartiya", "");
                          }
                          window.location.reload();
                        }}
                      />
                    </Space>
                  }
                >
                  <p style={{ marginBottom: "5px" }}>
                    <strong>Telefon:</strong> {partner.partner_number}
                  </p>
                  <p style={{ marginBottom: "5px" }}>
                    <strong>Manzil:</strong> {partner.partner_address}
                  </p>
                  <p style={{ marginBottom: "5px" }}>Partiya</p>
                  <Select
                    style={{ width: "100%" }}
                    disabled={!isChecked}
                    defaultValue={isChecked ? selectedPartiya : undefined}
                    onChange={(value) => {
                      localStorage.setItem("selectedPartiya", value);
                      window.location.reload();
                    }}
                  >
                    {partner.parts.map((item) => (
                      <Select.Option key={item} value={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Modal>

      <div style={{ display: "none" }}>
        <BarcodePrint ref={printRef} barcode={currentBarcode} />
      </div>
    </div>
  );
};

export default Product;
