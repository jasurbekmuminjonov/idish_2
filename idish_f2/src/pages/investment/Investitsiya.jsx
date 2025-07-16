import React, { useMemo } from "react";
import { Card, Space, Divider } from "antd";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";
import { useGetProductsByWarehouseQuery } from "../../context/service/product.service";
import { useGetUsdRateQuery } from "../../context/service/usd.service";
import { useGetSalesHistoryQuery } from "../../context/service/sotuv.service";
import { useGetAllDebtorsQuery } from "../../context/service/debt.service";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetExpensesQuery } from "../../context/service/expense.service";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  RiseOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "./investment.css";
import { useGetAllReportsQuery } from "../../context/service/report.service";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service";
import { useGetActPartnersQuery } from "../../context/service/act-partner.service";

const cardGradients = [
  "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
  "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
];

const WarehouseCard = ({ ombor, usdRate, sales, index }) => {
  const { data: mahsulotlar = [] } = useGetProductsByWarehouseQuery(ombor?._id);
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsQuery();
  const { data: usdRateData, isLoading: usdLoading } = useGetUsdRateQuery();

  const calculateStats = (products, warehouseSales) => {
    const purchaseUSD = products.reduce((sum, product) => {
      const quantity = Number(product.quantity) || 0;
      const purchaseValue = Number(product.purchasePrice?.value) || 0;
      return sum + purchaseValue * quantity;
    }, 0);

    const purchaseUZS = purchaseUSD * usdRate;

    let profitUSD = 0;
    let profitUZS = 0;

    if (warehouseSales.length > 0) {
      profitUSD = warehouseSales.reduce((sum, sale) => {
        const quantity = Number(sale.quantity) || 0;
        const sellingPrice = Number(sale.sellingPrice) || 0;
        const purchasePrice =
          Number(sale?.productId?.purchasePrice?.value) || 0;
        return sum + quantity * (sellingPrice - purchasePrice);
      }, 0);
      profitUZS = profitUSD * usdRate;
    } else {
      profitUSD = products.reduce((sum, product) => {
        const quantity = Number(product.quantity) || 0;
        const sellingPrice = Number(product.sellingPrice?.value) || 0;
        const purchasePrice = Number(product.purchasePrice?.value) || 0;
        return sum + quantity * (sellingPrice - purchasePrice);
      }, 0);
      profitUZS = profitUSD * usdRate;
    }

    const totalQuantity = products.reduce(
      (sum, p) => sum + (Number(p.box_quantity) || 0),
      0
    );
    const totalPurchase = products
      .reduce((sum, p) => sum + p.quantity * p.purchasePrice.value, 0)
      ?.toFixed(2);
    const totalKg = products
      .reduce((sum, p) => sum + p.total_kg, 0)
      ?.toFixed(2);
    const totalSale = products
      .reduce((sum, p) => sum + p.quantity * p.sellingPrice.value, 0)
      ?.toFixed(2);
    const totalProfit = products
      .reduce(
        (sum, p) =>
          sum + p.quantity * (p.sellingPrice.value - p.purchasePrice.value),
        0
      )
      .toFixed(2);

    const latestDate =
      products.length > 0
        ? new Date(
            Math.max(
              ...products.map((p) => new Date(p.createdAt || Date.now()))
            )
          ).toLocaleDateString()
        : new Date().toLocaleDateString();

    return {
      purchaseUZS,
      purchaseUSD,
      profitUZS,
      profitUSD,
      totalQuantity,
      totalProfit,
      totalSale,
      totalPurchase,
      totalProfit,
      latestDate,
      totalKg,
    };
  };

  const warehouseSales = sales.filter(
    (sale) => sale?.productId?.warehouse?._id === ombor?._id
  );
  const stats =
    mahsulotlar.length > 0 || warehouseSales.length > 0
      ? calculateStats(mahsulotlar, warehouseSales)
      : null;

  const cardStyle = {
    background: cardGradients[index % cardGradients.length],
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  function calculateNetProfitByWarehouseId(warehouseId) {
    if (!usdRateData?.rate || !usdRateData?.kyg) return 0;

    const usdRate = usdRateData.rate;
    const kygRate = usdRateData.kyg;

    let totalProfit = 0;

    const filteredSales = sales.filter(
      (sale) => sale.warehouseId?._id === warehouseId
    );

    for (const sale of filteredSales) {
      const product = products.find((p) => p?._id === sale.productId?._id);
      if (!product) continue;

      const {
        purchasePrice,
        quantity_per_package,
        package_quantity_per_box,
        isPackage,
      } = product;
      const tanNarx = purchasePrice?.value || 0;

      let realQuantity = sale.quantity;

      if (isPackage) {
        if (sale.unit === "package") {
          realQuantity *= quantity_per_package || 1;
        } else if (sale.unit === "box") {
          realQuantity *=
            (quantity_per_package || 1) * (package_quantity_per_box || 1);
        }
      } else {
        if (sale.unit === "box") {
          realQuantity *= package_quantity_per_box || 1;
        }
      }

      let sellingPriceInUSD = sale.sellingPrice;

      if (sale.currency === "SUM") {
        sellingPriceInUSD = sale.sellingPrice / usdRate;
      } else if (sale.currency === "KYG") {
        sellingPriceInUSD = sale.sellingPrice / kygRate;
      }

      const profitPerUnit = sellingPriceInUSD - tanNarx;
      const totalSaleProfit = profitPerUnit * realQuantity;

      totalProfit += totalSaleProfit;
    }

    return totalProfit.toFixed(2);
  }

  return (
    <Card
      key={ombor?._id}
      title={ombor.name}
      className="invest-warehouse-card"
      style={cardStyle}
      headStyle={{ borderBottom: "none" }}
      extra={<Space />}
    >
      <p className="invest-warehouse-address">
        <HomeOutlined />
        {ombor.address}
      </p>
      {stats ? (
        <div className="invest-warehouse-stats">
          <div className="invest-stat-item">
            <p>
              <strong>
                <CalendarOutlined /> Sana:
              </strong>{" "}
              <span className="invest-date">{stats.latestDate}</span>
            </p>
          </div>
          <Divider style={{ margin: "10px 0", borderColor: "#e8e8e8" }} />
          <div className="invest-stat-item">
            <p>
              <strong>
                <ShoppingCartOutlined /> Jami (mavjud):
              </strong>{" "}
              <span className="invest-quantity">
                {Number(stats.totalQuantity).toLocaleString()} karobka
              </span>
            </p>
          </div>
          <div className="invest-stat-item">
            <p>
              <strong>
                <ShoppingCartOutlined /> Jami (mavjud):
              </strong>{" "}
              <span className="invest-quantity">
                {Number(stats.totalKg).toLocaleString()} kg
              </span>
            </p>
          </div>
          <div className="invest-stat-item">
            <p>
              <strong>
                <ShoppingCartOutlined /> Jami tan narx:
              </strong>{" "}
              <span className="invest-quantity">
                {Number(stats.totalPurchase).toLocaleString()} USD
              </span>
            </p>
          </div>
          <div className="invest-stat-item">
            <p>
              <strong>
                <ShoppingCartOutlined /> Jami sotish narx
              </strong>{" "}
              <span className="invest-quantity">
                {Number(stats.totalSale).toLocaleString()} USD
              </span>
            </p>
          </div>
          <div className="invest-stat-item">
            <p>
              <strong>
                <ShoppingCartOutlined /> Jami foyda:
              </strong>{" "}
              <span className="invest-quantity">
                {Number(
                  calculateNetProfitByWarehouseId(ombor?._id)
                ).toLocaleString()}{" "}
                USD
              </span>
            </p>
          </div>
        </div>
      ) : (
        <p className="invest-no-data">Bu omborda mahsulotlar yo'q.</p>
      )}
    </Card>
  );
};

// Umumiy statistika uchun komponent
const SummaryCard = ({ expenses, debtors, products, sales, usdRate }) => {
  const { data: usdRateData, isLoading: usdLoading } = useGetUsdRateQuery();
  const { data: reports } = useGetAllReportsQuery();
  const { data: partnerProducts = [] } = useGetProductsPartnerQuery();
  // const { data: expenses = [] } = useGetExpensesQuery();
  const { data: partnersFromApi = [], isLoading: partnersLoading } =
    useGetActPartnersQuery();
  const totalExpensesUZS = expenses.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0
  );

  function calculateTotalNetProfitUSD() {
    if (!usdRateData?.rate || !usdRateData?.kyg) return 0;

    const kygRate = usdRateData.kyg;
    const usdRate = usdRateData.rate;

    let totalProfit = 0;

    for (const sale of sales) {
      const product = products.find((p) => p._id === sale.productId?._id);
      if (!product) continue;

      const {
        purchasePrice,
        quantity_per_package,
        package_quantity_per_box,
        isPackage,
      } = product;
      // realQuantity hisoblash
      let realQuantity = sale.quantity;
      if (isPackage) {
        if (sale.unit === "package") {
          realQuantity *= quantity_per_package || 1;
        } else if (sale.unit === "box") {
          realQuantity *=
            (quantity_per_package || 1) * (package_quantity_per_box || 1);
        }
      } else {
        if (sale.unit === "box") {
          realQuantity *= package_quantity_per_box || 1;
        }
      }

      let sellingPriceUSD = sale.sellingPrice;
      if (sale.currency === "SUM") {
        sellingPriceUSD = sale.sellingPrice / usdRate;
      } else if (sale.currency === "KYG") {
        sellingPriceUSD = sale.sellingPrice / kygRate;
      }

      const profitPerUnit =
        sellingPriceUSD - sale.productId.purchasePrice.value;
      const totalSaleProfit = profitPerUnit * realQuantity;

      totalProfit += totalSaleProfit;
    }

    return totalProfit.toFixed(2);
  }

  console.log(calculateTotalNetProfitUSD());

  const totalExpensesUSD = totalExpensesUZS / usdRate;

  const totalDebtUZS = debtors
    .filter((item) => item.currency === "SUM")
    .reduce((total, b) => {
      const quantity = Number(b.quantity) || 0;
      const sellingPrice = Number(b.sellingPrice) || 0;
      return total + b?.remainingAmount;
    }, 0);
  const totalDebtUSD = debtors
    .filter((item) => item.currency === "USD")
    .reduce((total, b) => {
      const quantity = Number(b.quantity) || 0;
      const sellingPrice = Number(b.sellingPrice) || 0;
      return total + b?.remainingAmount;
    }, 0);

  const totalPurchaseUSD = products.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const purchaseValue = Number(item.purchasePrice?.value) || 0;
    return total + purchaseValue * quantity;
  }, 0);
  const totalPurchaseUZS = totalPurchaseUSD * usdRate;

  const totalSalesProfitUSD = sales.reduce((total, b) => {
    const quantity = Number(b.quantity) || 0;
    const sellingPrice = Number(b.sellingPrice) || 0;
    const purchasePrice = Number(b?.productId?.purchasePrice?.value) || 0;
    return total + quantity * (sellingPrice - purchasePrice);
  }, 0);
  const totalSalesProfitUZS = totalSalesProfitUSD * usdRate;

  const productReport = useMemo(() => {
    if (!partnerProducts?.length) return null;

    return {
      amount: partnerProducts.reduce(
        (acc, p) => acc + (p.quantity || 0) * (p.purchasePrice?.value || 0),
        0
      ),
      currency: "USD",
      date: partnerProducts[0]?.createdAt || null,
      type: "payment",
    };
  }, [partnerProducts]);

  return (
    <Card
      title="Umumiy statistika"
      className="invest-summary-card"
      headStyle={{ borderBottom: "none" }} // Оставляем только минимальный headStyle
    >
      <div className="invest-warehouse-stats">
        <div className="invest-stat-item">
          <p>
            <strong>
              <DollarOutlined /> Umumiy xarajat:
            </strong>
          </p>
          <p>
            <span className="invest-purchase">
              {totalExpensesUZS.toLocaleString("uz-UZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              so'm
            </span>
          </p>
          <p>
            <span className="invest-purchase">
              {totalExpensesUSD?.toFixed(2)} $
            </span>
          </p>
        </div>
        <Divider
          style={{ margin: "10px 0", borderColor: "rgba(255, 255, 255, 0.2)" }}
        />
        <div className="invest-stat-item">
          <p>
            <strong>
              <CreditCardOutlined /> Umumiy nasiya:
            </strong>
          </p>
          <p>
            <span className="invest-debt">
              {totalDebtUZS.toLocaleString("uz-UZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              so'm
            </span>
          </p>
          <p>
            <span className="invest-debt">{totalDebtUSD?.toFixed(2)} $</span>
          </p>
        </div>
        <Divider
          style={{ margin: "10px 0", borderColor: "rgba(255, 255, 255, 0.2)" }}
        />
        <div className="invest-stat-item">
          <p>
            <strong>
              <ShoppingCartOutlined /> Umumiy mahsulotlar tan narxi:
            </strong>
          </p>
          {/* <p>
            <span className="invest-purchase">
              {totalPurchaseUZS.toLocaleString("uz-UZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              so'm
            </span>
          </p> */}
          <p>
            <span className="invest-purchase">
              {totalPurchaseUSD?.toFixed(2)} $
            </span>
          </p>
        </div>
        <Divider
          style={{ margin: "10px 0", borderColor: "rgba(255, 255, 255, 0.2)" }}
        />
        <div className="invest-stat-item">
          <p>
            <strong>
              <RiseOutlined /> Sof daromad:
            </strong>
          </p>
          {/* <p>
            <span className="invest-profit">
              {totalSalesProfitUZS.toLocaleString("uz-UZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              so'm
            </span>
          </p> */}
          <p>
            <span className="invest-profit">
              {(
                calculateTotalNetProfitUSD() -
                expenses.reduce(
                  (acc, item) => acc + item.amount / usdRateData.rate,
                  0
                )
              )?.toFixed()}{" "}
              $
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default function Investitsiya() {
  const { data: omborlar = [] } = useGetWarehousesQuery();
  const { data: usdRateData, isLoading: usdLoading } = useGetUsdRateQuery();
  const { data: sales = [], isLoading: salesLoading } =
    useGetSalesHistoryQuery();
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsQuery();
  const { data: debtors = [], isLoading: debtorsLoading } =
    useGetAllDebtorsQuery();
  const { data: expenses = [], isLoading: expensesLoading } =
    useGetExpensesQuery();

  const usdRate = usdRateData?.rate || 12960;

  if (
    usdLoading ||
    salesLoading ||
    debtorsLoading ||
    productsLoading ||
    expensesLoading
  ) {
    return <div className="invest-loading">Yuklanmoqda...</div>;
  }

  return (
    <div className="invest-container">
      <div className="invest-warehouse-cards">
        <SummaryCard
          expenses={expenses}
          debtors={debtors}
          products={products}
          sales={sales}
          usdRate={usdRate}
        />
        {omborlar.map((ombor, index) => (
          <WarehouseCard
            key={ombor?._id}
            ombor={ombor}
            usdRate={usdRate}
            sales={sales}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
