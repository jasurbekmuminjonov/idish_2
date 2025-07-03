import { useState, useMemo } from "react";
import { Select, Table, Input, Button } from "antd";
import { useGetClientsQuery } from "../../context/service/client.service";
import { useGetAllDebtorsQuery } from "../../context/service/debt.service";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service";
import { useGetSalesHistoryQuery } from "../../context/service/sales.service";
import dayjs from "dayjs";
import { useGetActPartnersQuery } from "../../context/service/act-partner.service";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const ReconciliationAct = () => {
  const { data: partnerProducts = [] } = useGetProductsPartnerQuery();
  const { data: sales = [] } = useGetSalesHistoryQuery();
  const { data: debts = [] } = useGetAllDebtorsQuery();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: partnersFromApi = [], isLoading: partnersLoading } =
    useGetActPartnersQuery();
  const navigate = useNavigate();

  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [focused, setFocused] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const allPartners = useMemo(() => {
    const map = new Map();
    partnerProducts.forEach((p) => {
      if (!map.has(p.partner_number)) {
        map.set(p.partner_number, p.name_partner);
      }
    });
    return Array.from(map.entries()).map(([number, name]) => ({
      value: number,
      label: name,
    }));
  }, [partnerProducts]);

  const isInDateRange = (date) => {
    if (!startDate || !endDate) return true;
    const d = dayjs(date);
    return (
      d.isAfter(dayjs(startDate).startOf("day")) &&
      d.isBefore(dayjs(endDate).endOf("day"))
    );
  };

  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      const matchDate = isInDateRange(item.createdAt);
      if (selectedClient)
        return item.clientId?._id === selectedClient && matchDate;
      if (selectedPartner) return item.partnerId && matchDate;
      return false;
    });
  }, [sales, selectedClient, selectedPartner, startDate, endDate]);

  const filteredDebts = useMemo(() => {
    return debts.filter((item) => {
      const matchDate = isInDateRange(item.createdAt);
      if (selectedClient)
        return item.clientId?._id === selectedClient && matchDate;
      if (selectedPartner)
        return item.partnerId === selectedPartner && matchDate;
      return false;
    });
  }, [debts, selectedClient, selectedPartner, startDate, endDate]);

  const filteredPartnerProducts = useMemo(() => {
    return partnerProducts.filter(
      (item) =>
        item.partner_number === selectedPartner && isInDateRange(item.createdAt)
    );
  }, [partnerProducts, selectedPartner, startDate, endDate]);

  const quantityText = {
    quantity: "Dona",
    package_quantity: "Pachka",
    box_quantity: "Karobka",
  };

  const printPDF = () => {
    let content = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #000;
        padding: 5px;
        text-align: left;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
`;

    if (selectedClient) {
      const client = clients.find((c) => c._id === selectedClient);
      content += `
    <h2>Клиент: ${client?.name}</h2>
    <p>Номер телефона: ${client?.phone}</p>
    <p>Адрес: ${client?.address}</p>
  `;

      // SALES
      content += `<h2>Продажи</h2><table><thead><tr>
    <th>Продукт</th><th>Количество</th><th>Единство</th><th>Цена</th><th>Валюта</th><th>Общий</th>
  </tr></thead><tbody>`;

      let salesUSD = 0,
        salesSUM = 0,
        salesKYG = 0;

      filteredSales.forEach((item) => {
        const total = item.quantity * item.sellingPrice;
        if (item.currency === "USD") salesUSD += total;
        else if (item.currency === "SUM") salesSUM += total;
        else if (item.currency === "KYG") salesKYG += total;

        content += `<tr>
      <td>${item.productId?.name}</td>
      <td>${item.quantity}</td>
      <td>${quantityText[item.unit] || item.unit}</td>
      <td>${item.sellingPrice}</td>
      <td>${item.currency}</td>
      <td>${total.toFixed(2)}</td>
    </tr>`;
      });

      content += `<tr>
      <td colspan="2"><strong>${salesUSD.toFixed(2)} USD</strong></td>
      <td colspan="2"><strong>${salesSUM.toFixed(2)} SUM</strong></td>
      <td colspan="2"><strong>${salesKYG.toFixed(2)} KYG</strong></td>
    </tr>`;

      content += `</tbody></table>`;

      // DEBTS
      content += `<h2>Долги</h2><table><thead><tr>
    <th>Продукт</th><th>Количество</th><th>Единство</th><th>Цена</th><th>Валюта</th><th>Общий</th><th>Остальные</th>
  </tr></thead><tbody>`;

      let debtUSD = 0,
        debtSUM = 0,
        debtKYG = 0;

      filteredDebts.forEach((item) => {
        if (item.currency === "USD") debtUSD += item.remainingAmount;
        else if (item.currency === "SUM") debtSUM += item.remainingAmount;
        else if (item.currency === "KYG") debtKYG += item.remainingAmount;

        content += `<tr>
      <td>${item.productId?.name}</td>
      <td>${item.quantity}</td>
      <td>${quantityText[item.unit] || item.unit}</td>
      <td>${item.sellingPrice}</td>
      <td>${item.currency}</td>
      <td>${item.totalAmount}</td>
      <td>${item.remainingAmount}</td>
    </tr>`;
      });

      content += `<tr>
      <td colspan="2"><strong>${debtUSD.toFixed(2)} USD</strong></td>
      <td colspan="2"><strong>${debtSUM.toFixed(2)} SUM</strong></td>
      <td colspan="3"><strong>${debtKYG.toFixed(2)} KYG</strong></td>
    </tr>`;

      content += `</tbody></table>`;
    }

    if (selectedPartner) {
      const partner = allPartners.find((p) => p.value === selectedPartner);
      content += `
    <h2>Партнер: ${partner?.label}</h2>
    <p>Номер телефона: ${partner?.value}</p>
  `;

      // SALES
      content += `<h2>Продажи</h2><table><thead><tr>
    <th>Продукт</th><th>Количество</th><th>Единство</th><th>Цена</th><th>Валюта</th><th>Общий</th>
  </tr></thead><tbody>`;

      let salesUSD = 0,
        salesSUM = 0,
        salesKYG = 0;

      filteredSales.forEach((item) => {
        const total = item.quantity * item.sellingPrice;
        if (item.currency === "USD") salesUSD += total;
        else if (item.currency === "SUM") salesSUM += total;
        else if (item.currency === "KYG") salesKYG += total;

        content += `<tr>
      <td>${item.productId?.name}</td>
      <td>${item.quantity}</td>
      <td>${quantityText[item.unit] || item.unit}</td>
      <td>${item.sellingPrice}</td>
      <td>${item.currency}</td>
      <td>${total.toFixed(2)}</td>
    </tr>`;
      });

      content += `<tr>
      <td colspan="2"><strong>${salesUSD.toFixed(2)} USD</strong></td>
      <td colspan="2"><strong>${salesSUM.toFixed(2)} SUM</strong></td>
      <td colspan="2"><strong>${salesKYG.toFixed(2)} KYG</strong></td>
    </tr>`;

      content += `</tbody></table>`;

      // DEBTS
      content += `<h2>Долги</h2><table><thead><tr>
    <th>Продукт</th><th>Количество</th><th>Единство</th><th>Цена</th><th>Валюта</th><th>Общий</th><th>Остальные</th>
  </tr></thead><tbody>`;

      let debtUSD = 0,
        debtSUM = 0,
        debtKYG = 0;

      filteredDebts.forEach((item) => {
        if (item.currency === "USD") debtUSD += item.remainingAmount;
        else if (item.currency === "SUM") debtSUM += item.remainingAmount;
        else if (item.currency === "KYG") debtKYG += item.remainingAmount;

        content += `<tr>
      <td>${item.productId?.name}</td>
      <td>${item.quantity}</td>
      <td>${quantityText[item.unit] || item.unit}</td>
      <td>${item.sellingPrice}</td>
      <td>${item.currency}</td>
      <td>${item.totalAmount}</td>
      <td>${item.remainingAmount}</td>
    </tr>`;
      });

      content += `<tr>
      <td colspan="2"><strong>${debtUSD.toFixed(2)} USD</strong></td>
      <td colspan="2"><strong>${debtSUM.toFixed(2)} SUM</strong></td>
      <td colspan="3"><strong>${debtKYG.toFixed(2)} KYG</strong></td>
    </tr>`;

      content += `</tbody></table>`;

      // PARTNER PRODUCTS
      content += `<h2>Товары партнёра</h2><table><thead><tr>
    <th>Продукт</th><th>Размер</th><th>Количество</th><th>Пачка</th><th>Каробка</th><th>Цена покупки</th><th>Цена продажи</th><th>Валюта</th><th>Общий</th>
  </tr></thead><tbody>`;

      let prodUSD = 0,
        prodSUM = 0,
        prodKYG = 0;

      filteredPartnerProducts.forEach((item) => {
        const total = item.quantity * item.purchasePrice?.value;
        if (item.currency === "USD") prodUSD += total;
        else if (item.currency === "SUM") prodSUM += total;
        else if (item.currency === "KYG") prodKYG += total;

        content += `<tr>
      <td>${item.name}</td>
      <td>${item.size}</td>
      <td>${item.quantity}</td>
      <td>${item.package_quantity}</td>
      <td>${item.box_quantity}</td>
      <td>${item.purchasePrice?.value}</td>
      <td>${item.sellingPrice?.value}</td>
      <td>${item.currency}</td>
      <td>${total.toFixed(2)}</td>
    </tr>`;
      });

      content += `<tr>
      <td colspan="3"><strong>${prodUSD.toFixed(2)} USD</strong></td>
      <td colspan="3"><strong>${prodSUM.toFixed(2)} SUM</strong></td>
      <td colspan="3"><strong>${prodKYG.toFixed(2)} KYG</strong></td>
    </tr>`;

      content += `</tbody></table>`;
    }

    content += `</body></html>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  let optiondata = partnersFromApi.map((partner) => ({
    label: partner.partner_name,
    value: partner.partner_number,
  }));

  return (
    <div className="act" style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Button onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </Button>
        <Select
          showSearch
          placeholder="Hamkorni tanlang"
          style={{ width: 250 }}
          onFocus={() => setFocused("partner")}
          // disabled={focused === "client"}
          value={selectedPartner || undefined}
          onChange={(val) => {
            setSelectedPartner(val);
            setSelectedClient("");
          }}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          options={optiondata}
        />

        <Select
          showSearch
          placeholder="Mijozni tanlang"
          style={{ width: 250 }}
          onFocus={() => setFocused("client")}
          // disabled={focused === "partner"}
          value={selectedClient || undefined}
          onChange={(val) => {
            setSelectedClient(val);
            setSelectedPartner("");
          }}
          options={clients.map((c) => ({
            value: c._id,
            label: c.name,
          }))}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />

        <Button
          disabled={!selectedClient && !selectedPartner}
          type="primary"
          onClick={printPDF}
        >
          Chop etish
        </Button>

        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* CLIENT TABLES */}
      {selectedClient && (
        <>
          <Table
            dataSource={filteredSales}
            rowKey="_id"
            title={() => "Sotuvlar"}
            pagination={false}
            columns={[
              { title: "Mahsulot", dataIndex: ["productId", "name"] },
              { title: "Miqdor", dataIndex: "quantity" },
              {
                title: "Birlik",
                dataIndex: "unit",
                render: (unit) => quantityText[unit] || unit,
              },
              { title: "Narx", dataIndex: "sellingPrice" },
              {
                title: "Jami",
                render: (_, row) =>
                  (row.quantity * row.sellingPrice).toLocaleString(),
              },
            ]}
          />

          <Table
            dataSource={filteredDebts}
            rowKey="_id"
            title={() => "Qarzlar"}
            pagination={false}
            columns={[
              { title: "Mahsulot", dataIndex: ["productId", "name"] },
              { title: "Miqdor", dataIndex: "quantity" },
              {
                title: "Birlik",
                dataIndex: "unit",
                render: (unit) => quantityText[unit] || unit,
              },
              { title: "Narx", dataIndex: "sellingPrice" },
              { title: "Jami", dataIndex: "totalAmount" },
              { title: "Qolgan", dataIndex: "remainingAmount" },
            ]}
            style={{ marginTop: 20 }}
          />
        </>
      )}

      {selectedPartner && (
        <>
          <Table
            dataSource={filteredSales}
            rowKey="_id"
            title={() => "Sotuvlar"}
            pagination={false}
            columns={[
              { title: "Mahsulot", dataIndex: ["productId", "name"] },
              { title: "Miqdor", dataIndex: "quantity" },
              {
                title: "Birlik",
                dataIndex: "unit",
                render: (unit) => quantityText[unit] || unit,
              },
              { title: "Narx", dataIndex: "sellingPrice" },
              {
                title: "Jami",
                render: (_, row) =>
                  (row.quantity * row.sellingPrice).toLocaleString(),
              },
            ]}
          />

          <Table
            dataSource={filteredDebts}
            rowKey="_id"
            title={() => "Qarzlar"}
            pagination={false}
            columns={[
              { title: "Mahsulot", dataIndex: ["productId", "name"] },
              { title: "Miqdor", dataIndex: "quantity" },
              {
                title: "Birlik",
                dataIndex: "unit",
                render: (unit) => quantityText[unit] || unit,
              },
              { title: "Narx", dataIndex: "sellingPrice" },
              { title: "Jami", dataIndex: "totalAmount" },
              { title: "Qolgan", dataIndex: "remainingAmount" },
            ]}
            style={{ marginTop: 20 }}
          />

          <Table
            dataSource={filteredPartnerProducts}
            rowKey="_id"
            title={() => "Hamkor tovarlari"}
            pagination={false}
            columns={[
              { title: "Mahsulot", dataIndex: "name" },
              { title: "Hajmi", dataIndex: "size" },
              { title: "Miqdor", dataIndex: "quantity" },
              { title: "Paket", dataIndex: "package_quantity" },
              { title: "Quti", dataIndex: "box_quantity" },
              { title: "Olish narxi", dataIndex: ["purchasePrice", "value"] },
              { title: "Sotish narxi", dataIndex: ["sellingPrice", "value"] },
              { title: "Valyuta", dataIndex: "currency" },
              {
                title: "Jami",
                render: (_, row) =>
                  (row.quantity * row.sellingPrice.value).toLocaleString(),
              },
            ]}
            style={{ marginTop: 20 }}
          />
        </>
      )}
    </div>
  );
};

export default ReconciliationAct;
