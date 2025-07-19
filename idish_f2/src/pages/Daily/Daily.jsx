import { Card, Statistic, Row, Col, Select, Divider } from "antd";
import moment from "moment";
import { useGetStoresQuery } from "../../context/service/ombor.service";
import {
  useGetAllDebtorsQuery,
  useLazyGetDailyPaymentsByStoreIdQuery,
} from "../../context/service/debt.service";
import { useEffect, useState } from "react";
import { useGetSalesHistoryQuery } from "../../context/service/sales.service";

const { Option } = Select;

const Daily = () => {
  const { data: stores = [] } = useGetStoresQuery();
  const [getDailyPayment] = useLazyGetDailyPaymentsByStoreIdQuery();
  const { data: sales = [] } = useGetSalesHistoryQuery();
  const { data: debts = [] } = useGetAllDebtorsQuery();
  console.log(debts);

  const today = moment().format("YYYY-MM-DD");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedStore, setSelectedStore] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [totalSalesByCurrency, setTotalSalesByCurrency] = useState({});
  const [totalDebtsByCurrency, setTotalDebtsByCurrency] = useState({});
  const [totalDebtByCurrency, setTotalDebtByCurrency] = useState({});
  const [allDebtByCurrency, setAllDebtByCurrency] = useState({});

  useEffect(() => {
    const fetchPayments = async () => {
      if (selectedStore && fromDate && toDate) {
        const datesInRange = [];
        let current = moment(fromDate);
        const end = moment(toDate);
        while (current.isSameOrBefore(end)) {
          datesInRange.push(current.format("YYYY-MM-DD"));
          current = current.add(1, "day");
        }

        // Sotuvlarni filterlash va guruhlash
        const filteredSales = sales.filter(
          (sale) =>
            sale.storeId === selectedStore &&
            datesInRange.includes(moment(sale.createdAt).format("YYYY-MM-DD"))
        );

        const filteredDebts = debts.filter(
          (sale) =>
            sale.storeId === selectedStore &&
            datesInRange.includes(moment(sale.createdAt).format("YYYY-MM-DD"))
        );

        const salesCurrencyMap = {};
        for (const sale of filteredSales) {
          const currency = sale.currency || "SUM";
          const amount = sale.quantity * sale.sellingPrice;
          salesCurrencyMap[currency] =
            (salesCurrencyMap[currency] || 0) + amount;
        }

        // Qarz to‘lovlarini olish va guruhlash
        let allPayments = [];
        for (const date of datesInRange) {
          const res = await getDailyPayment({
            date: moment(date).format("DD-MM-YYYY"),
            storeId: selectedStore,
          });
          if (res.data) {
            allPayments = [...allPayments, ...res.data];
          }
        }

        const debtCurrencyMap = {};
        for (const payment of allPayments) {
          const currency = payment.currency || "SUM";
          debtCurrencyMap[currency] =
            (debtCurrencyMap[currency] || 0) + payment.amount;
        }

        // const debtsCurrencyMap = {};
        // for (const sale of filteredDebts) {
        //   const currency = "USD";
        //   const amount = sale.totalAmount;
        //   salesCurrencyMap[currency] =
        //     (salesCurrencyMap[currency] || 0) + amount;
        // }

        setPaymentData(allPayments);
        setTotalSalesByCurrency(salesCurrencyMap);
        setTotalDebtByCurrency(debtCurrencyMap);
        // setTotalDebtsByCurrency(debtsCurrencyMap);
      }
    };

    fetchPayments();
  }, [selectedStore, fromDate, toDate, sales]);

  const currencies = Array.from(
    new Set([
      ...Object.keys(totalSalesByCurrency),
      ...Object.keys(totalDebtByCurrency),
    ])
  );

  const filteredDebts = debts.filter((debt) => {
    const createdDate = moment(debt.createdAt).startOf("day");
    const from = moment(fromDate).startOf("day");
    const to = moment(toDate).endOf("day");

    return (
      debt.storeId === selectedStore &&
      createdDate.isSameOrAfter(from) &&
      createdDate.isSameOrBefore(to)
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              height: "33px",
              paddingInline: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </Col>
        <Col>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              height: "33px",
              paddingInline: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </Col>
        <Col>
          <Select
            placeholder="Do'kon tanlang"
            style={{ width: 200 }}
            value={selectedStore}
            onChange={(val) => setSelectedStore(val)}
          >
            {stores.map((store) => (
              <Option key={store._id} value={store._id}>
                {store.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {selectedStore && currencies.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {currencies.map((currency) => {
            const salesVal = totalSalesByCurrency[currency] || 0;
            const debtsVal = totalDebtsByCurrency[currency] || 0;
            const debtVal = totalDebtByCurrency[currency] || 0;
            const totalVal = salesVal + debtVal + debtsVal;
            return (
              <Col span={8} key={currency}>
                <Card>
                  <Statistic
                    title={`Umumiy sotuv (${currency})`}
                    value={salesVal.toFixed(2)}
                    suffix={currency}
                    valueStyle={{ color: "#3f8600" }}
                  />
                  <Statistic
                    title={`Umumiy qarz to'lovi (${currency})`}
                    value={debtVal.toFixed(2)}
                    suffix={currency}
                    valueStyle={{ color: "#3f8600" }}
                  />
                  <Statistic
                    title={`Umumiy qarz berish (${currency})`}
                    value={
                      currency !== "USD"
                        ? 0
                        : filteredDebts.reduce(
                            (acc, item) => acc + item.totalAmount,
                            0
                          )
                    }
                    suffix={currency}
                    valueStyle={{ color: "#3f8600" }}
                  />
                  <Statistic
                    title={`Umumiy kirim (${currency})`}
                    value={totalVal.toFixed(2)}
                    suffix={currency}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* <Divider orientation="left">📦 Sotuvlar</Divider>
      <Row gutter={[16, 16]}>
        {sales
          .filter(
            (sale) =>
              sale.storeId === selectedStore &&
              moment(sale.createdAt).isBetween(
                fromDate,
                toDate,
                undefined,
                "[]"
              )
          )
          .map((sale) => (
            <Col span={8} key={sale._id}>
              <Card title={sale.productId.name}>
                <p>Soni: {sale.quantity}</p>
                <p>Narx: {sale.sellingPrice?.toFixed(2)}</p>
                <p>Valyuta: {sale.currency}</p>
                <p>Jami: {(sale.sellingPrice * sale.quantity)?.toFixed(2)}</p>
              </Card>
            </Col>
          ))}
      </Row>

      <Divider orientation="left">💵 Qarz to'lovlari</Divider>
      <Row gutter={[16, 16]}>
        {paymentData.map((payment) => (
          <Col span={8} key={payment._id}>
            <Card>
              <p>To'lov summasi: {payment.amount}</p>
              <p>Valyuta: {payment.currency}</p>
            </Card>
          </Col>
        ))}
      </Row> */}
    </div>
  );
};

export default Daily;
