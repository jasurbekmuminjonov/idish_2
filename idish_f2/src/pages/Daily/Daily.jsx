import { Card, Statistic, Row, Col, DatePicker, Select, Divider } from "antd";
import moment from "moment";
import { useGetStoresQuery } from '../../context/service/ombor.service';
import { useLazyGetDailyPaymentsByStoreIdQuery } from '../../context/service/debt.service';
import { useEffect, useState } from 'react';
import { useGetSalesHistoryQuery } from '../../context/service/sales.service';
const { Option } = Select;

const Daily = () => {
    const { data: stores = [] } = useGetStoresQuery();
    const [getDailyPayment, { data = [] }] = useLazyGetDailyPaymentsByStoreIdQuery();
    const { data: sales = [] } = useGetSalesHistoryQuery();
    const [paymentData, setPaymentData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
    const [selectedStore, setSelectedStore] = useState(null);
    const [totalSales, setTotalSales] = useState(0);
    const [totalDebt, setTotalDebt] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                if (selectedDate && selectedStore) {
                    const res = await getDailyPayment({
                        date: moment(selectedDate).format("DD-MM-YYYY"),
                        storeId: selectedStore,
                    });
                    if (res.data) {
                        setPaymentData(res.data);
                        setTotalSales(
                            sales
                                .filter(
                                    (sale) =>
                                        sale.storeId === selectedStore &&
                                        moment(sale.createdAt).format("YYYY-MM-DD") === selectedDate
                                )
                                .reduce((acc, item) => acc + item.quantity * item.sellingPrice, 0)
                        );
                        setTotalDebt(res.data.reduce((acc, item) => acc + item.amount, 0));
                        setTotal(res.data.reduce((acc, item) => acc + item.amount, 0) + sales
                            .filter(
                                (sale) =>
                                    sale.storeId === selectedStore &&
                                    moment(sale.createdAt).format("YYYY-MM-DD") === selectedDate
                            )
                            .reduce((acc, item) => acc + item.quantity * item.sellingPrice, 0));
                    } else {
                        setPaymentData([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching daily payments:", error);
            }
        };

        fetchPayments();

        setTotalSales(
            sales
                .filter(
                    (sale) =>
                        sale.storeId === selectedStore &&
                        moment(sale.createdAt).format("YYYY-MM-DD") === selectedDate
                )
                .reduce((acc, item) => acc + item.quantity * item.sellingPrice, 0)
        );
        setTotalDebt(paymentData.reduce((acc, item) => acc + item.amount, 0));
    }, [selectedStore, selectedDate]);

    return (
        <div style={{ padding: "20px" }}>
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col>
                    <input style={{ height: "33px", paddingInline: "10px", borderRadius: "5px", border: "1px solid #ccc" }} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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

            {selectedStore && selectedDate && (
                <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Umumiy sotuv"
                                value={totalSales}
                                suffix="UZS"
                                valueStyle={{ color: "#3f8600" }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Umumiy qarz to'lovi"
                                value={totalDebt}
                                suffix="UZS"
                                valueStyle={{ color: "#3f8600" }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Umumiy kirim"
                                value={total}
                                suffix="UZS"
                                valueStyle={{ color: "#3f8600" }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Divider orientation="left">📦 Sotuvlar</Divider>
            <Row gutter={[16, 16]}>
                {sales
                    .filter(
                        (sale) =>
                            sale.storeId === selectedStore &&
                            moment(sale.createdAt).format("YYYY-MM-DD") === selectedDate
                    )
                    .map((sale) => (
                        <Col span={8} key={sale._id}>
                            <Card title={sale.productId.name} bordered>
                                <p>Soni: {sale.quantity}</p>
                                <p>Narx: {sale.sellingPrice}</p>
                                <p>Jami: {sale.sellingPrice * sale.quantity}</p>
                            </Card>
                        </Col>
                    ))}
            </Row>

            <Divider orientation="left">💵 Qarz to'lovlari</Divider>
            <Row gutter={[16, 16]}>
                {paymentData.map((payment) => (
                    <Col span={8} key={payment._id}>
                        <Card title={`${payment.client.name} - ${payment.client.phone}`} bordered>
                            <p>To'lov summasi: {payment.amount}</p>
                            <p>Valyuta: {payment.currency}</p>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Daily;
