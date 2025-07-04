import { useState, useMemo } from "react";
import { Select, Table, Input, Button, Space } from "antd";
import { useGetClientsQuery } from "../../context/service/client.service";
import { useGetAllDebtorsQuery } from "../../context/service/debt.service";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service";
import { useGetSalesHistoryQuery } from "../../context/service/sales.service";
import dayjs from "dayjs";
import { useGetActPartnersQuery } from "../../context/service/act-partner.service";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useGetAllReportsQuery } from "../../context/service/report.service";

const ReconciliationAct = () => {
  const { data: partnerProducts = [] } = useGetProductsPartnerQuery();
  const { data: sales = [] } = useGetSalesHistoryQuery();
  const { data: debts = [] } = useGetAllDebtorsQuery();
  const { data: reports = [] } = useGetAllReportsQuery();
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
  const filteredAstatkaPayments = useMemo(() => {
    return reports.filter((item) => {
      if (item.type !== "payment") {
        return false;
      }
      const matchDate = isInDateRange(item.createdAt);
      if (selectedClient)
        return (
          item.clientId === selectedClient ||
          (item.clientId?._id === selectedClient && matchDate)
        );
      if (selectedPartner)
        return item.partnerId === selectedPartner && matchDate;
      return false;
    });
  }, [reports, selectedClient, selectedPartner, startDate, endDate]);
  const filteredAstatkaDebts = useMemo(() => {
    return reports
      .filter((item) => {
        if (item.type !== "debt") return false;

        const matchDate = isInDateRange(item.createdAt);

        if (selectedClient)
          return (
            item.clientId === selectedClient ||
            (item.clientId?._id === selectedClient && matchDate)
          );

        if (selectedPartner)
          return item.partnerId === selectedPartner && matchDate;

        return false;
      })
      .map((item) => ({
        clientId: {
          _id: item.clientId || null,
          name: null,
          phone: null,
          address: null,
          createdAt: null,
          updatedAt: null,
          __v: 0,
        },
        partnerId: item.partnerId || null,
        paymentMethod: "credit",
        status: "pending",
        productId: null,
        quantity: null,
        unit: null,
        sellingPrice: null,
        warehouseId: null,
        totalAmount: item.amount,
        currency: item.currency,
        discount: 0,
        dueDate: null,
        paymentHistory: [],
        remainingAmount: item.amount,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        __v: 0,
      }));
  }, [reports, selectedClient, selectedPartner, startDate, endDate]);

  console.log(filteredAstatkaDebts);
  console.log(filteredAstatkaPayments);
  console.log(reports);
  console.log(debts);

  const filteredPartnerProducts = useMemo(() => {
    return partnerProducts.filter(
      (item) =>
        item.partner_number === selectedPartner && isInDateRange(item.createdAt)
    );
  }, [partnerProducts, selectedPartner, startDate, endDate]);

  const summaryByCurrency = useMemo(() => {
    const result = {
      USD: { sales: 0, balance: 0, debt: 0, products: 0 },
      SUM: { sales: 0, balance: 0, debt: 0, products: 0 },
      KYG: { sales: 0, balance: 0, debt: 0, products: 0 },
    };

    const allDebts = filteredDebts.concat(filteredAstatkaDebts);
    allDebts.forEach((d) => {
      if (result[d.currency]) {
        result[d.currency].debt += d.remainingAmount;
      }
    });

    filteredSales.forEach((s) => {
      if (result[s.currency]) {
        result[s.currency].sales += s.sellingPrice * s.quantity;
      }
    });

    filteredAstatkaPayments.forEach((p) => {
      if (result[p.currency]) {
        result[p.currency].balance += p.amount;
      }
    });

    filteredDebts.concat(filteredAstatkaDebts).forEach((d) => {
      if (result[d.currency]) {
        result[d.currency].debt += d.remainingAmount;
      }
    });

    filteredPartnerProducts.forEach((p) => {
      if (result[p.currency]) {
        result[p.currency].products +=
          (p.purchasePrice?.value || 0) * (p.quantity || 0);
      }
    });
    Object.keys(result).forEach((currency) => {
      result[currency].balance -= result[currency].debt;
    });

    return result;
  }, [filteredSales, filteredDebts, filteredPartnerProducts]);

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

    const allDebts = filteredDebts.concat(filteredAstatkaDebts);

    const calcBalance = (currency) => {
      const payments = filteredAstatkaPayments
        .filter((p) => p.currency === currency)
        .reduce((sum, p) => sum + p.amount, 0);

      const debts = allDebts
        .filter((d) => d.currency === currency)
        .reduce((sum, d) => sum + d.remainingAmount, 0);

      const products = selectedPartner
        ? filteredPartnerProducts
            .filter((p) => p.currency === currency)
            .reduce(
              (sum, p) =>
                sum + (p.purchasePrice?.value || 0) * (p.quantity || 0),
              0
            )
        : 0;

      return (payments - debts - products).toFixed(2);
    };

    content += `
<h2>Oldi-berdi</h2>
<table>
  <thead>
    <tr>
      <th>USD</th>
      <th>SUM</th>
      <th>KYG</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${calcBalance("USD")} USD</td>
      <td>${calcBalance("SUM")} SUM</td>
      <td>${calcBalance("KYG")} KYG</td>
    </tr>
  </tbody>
</table>
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

      filteredDebts.concat(filteredAstatkaDebts).forEach((item) => {
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

      filteredDebts.concat(filteredAstatkaDebts).forEach((item) => {
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
    <div className="act" style={{ padding: 20, background: "#fff" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Space direction="vertical">
          <Button onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </Button>
          <Button
            disabled={!selectedClient && !selectedPartner}
            type="primary"
            onClick={printPDF}
          >
            Chop etish
          </Button>
        </Space>

        <Space direction="vertical">
          <Select
            showSearch
            placeholder="Hamkorni tanlang"
            style={{ width: 200 }}
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
            style={{ width: 200 }}
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
        </Space>

        <Space direction="vertical">
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
        </Space>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "20px 0",
          fontSize: 14,
          border: "1px solid #ccc",
        }}
      >
        <thead>
          <tr style={{ background: "#fafafa" }}>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Valyuta</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>
              Umumiy sotuv
            </th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>
              Umumiy qarz
            </th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Oldi-berdi</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>
              Umumiy tovar (olish narxi)
            </th>
          </tr>
        </thead>
        <tbody>
          {["USD", "SUM", "KYG"].map((currency) => (
            <tr key={currency}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {currency}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {summaryByCurrency[currency].sales.toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {summaryByCurrency[currency].debt.toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {summaryByCurrency[currency].balance.toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {summaryByCurrency[currency].products.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            dataSource={filteredDebts.concat(filteredAstatkaDebts)}
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
              {
                title: "Narx",
                dataIndex: "sellingPrice",
                render: (text) => text?.toLocaleString(),
              },
              {
                title: "Valyuta",
                dataIndex: "currency",
              },
              {
                title: "Jami",
                dataIndex: "totalAmount",
                render: (text) => text?.toLocaleString(),
              },
              {
                title: "Qolgan",
                dataIndex: "remainingAmount",
                render: (text) => text?.toLocaleString(),
              },
            ]}
            style={{ marginTop: 20 }}
          />
          <Table
            dataSource={filteredAstatkaPayments}
            rowKey="_id"
            title={() => "To'lovlar"}
            pagination={false}
            columns={[
              {
                title: "Summa",
                dataIndex: "amount",
                render: (text) => text?.toLocaleString(),
              },
              {
                title: "Valyuta",
                dataIndex: "currency",
              },
              {
                title: "Sana",
                dataIndex: "createdAt",
                render: (text) => moment(text).format("DD.MM.YYYY"),
              },
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
            dataSource={filteredDebts.concat(filteredAstatkaDebts)}
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
              {
                title: "Narx",
                dataIndex: "sellingPrice",
                render: (text) => text?.toLocaleString(),
              },
              {
                title: "Valyuta",
                dataIndex: "currency",
              },
              {
                title: "Jami",
                dataIndex: "totalAmount",
                render: (text) => text?.toLocaleString(),
              },
              {
                title: "Qolgan",
                dataIndex: "remainingAmount",
                render: (text) => text?.toLocaleString(),
              },
            ]}
            style={{ marginTop: 20 }}
          />
          <Table
            dataSource={filteredAstatkaPayments}
            rowKey="_id"
            title={() => "To'lovlar"}
            pagination={false}
            columns={[
              {
                title: "Summa",
                dataIndex: "amount",
                render: (text) => text?.toLocaleString(),
              },
              {
                title: "Valyuta",
                dataIndex: "currency",
              },
              {
                title: "Sana",
                dataIndex: "createdAt",
                render: (text) => moment(text).format("DD.MM.YYYY"),
              },
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
