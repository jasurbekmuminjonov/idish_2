import React, { useState } from 'react';
import { useGetProductsQuery } from '../../context/service/product.service';
import { useGetProductsPartnerQuery } from '../../context/service/partner.service';
import { Card, Col, Row, Modal, Table, Typography, Space, Input, Select } from 'antd';
import { MdScale } from 'react-icons/md';
import './partner.css';

const { Title, Text } = Typography;

const Partner = () => {
     const { data: mahsulotlar = [] } = useGetProductsQuery();
     const { data: hamkorMahsulotlari = [] } = useGetProductsPartnerQuery();
     const [tanlanganHamkor, setTanlanganHamkor] = useState(null);
     const [modalKoʻrinadi, setModalKoʻrinadi] = useState(false);
     const [searchName, setSearchName] = useState("");
     const [searchNumber, setSearchNumber] = useState("");
     const [selectedAddress, setSelectedAddress] = useState("");

     const barchaMahsulotlar = [
          ...mahsulotlar.map((mahsulot) => ({
               ...mahsulot,
               manba: 'mahsulot',
               hamkor_nomi: mahsulot.name_partner || '',
               hamkor_raqami: mahsulot.partner_number || '',
               hamkor_manzili: mahsulot.partner_address || '',
          })),
          ...hamkorMahsulotlari.map((mahsulot) => ({
               ...mahsulot,
               manba: 'hamkor',
               hamkor_nomi: mahsulot.name_partner || '',
               hamkor_raqami: mahsulot.partner_number || '',
               hamkor_manzili: mahsulot.partner_address || '',

          })),
     ];

     const unikalHamkorlar = Array.from(
          new Map(
               barchaMahsulotlar
                    .filter((p) => p.hamkor_nomi && p.hamkor_raqami)
                    .map((p) => [p.hamkor_nomi, { nom: p.hamkor_nomi, raqam: p.hamkor_raqami, manzil: p.hamkor_manzili }])
          ).values()
     ).filter((hamkor) => {
          const matchesName = hamkor.nom.toLowerCase().includes(searchName.toLowerCase());
          const matchesNumber = hamkor.raqam.toLowerCase().includes(searchNumber.toLowerCase());
          return matchesName && matchesNumber;
     });

     const unikalManzillar = Array.from(
          new Set(barchaMahsulotlar.map(p => p.hamkor_manzili).filter(Boolean))
     );
     console.log(unikalManzillar);



     const filtrlanganMahsulotlar = tanlanganHamkor
          ? barchaMahsulotlar.filter((p) => p.hamkor_nomi === tanlanganHamkor.nom)
          : [];

     const ustunlar = [
          {
               title: 'Mahsulot',
               dataIndex: 'name',
               key: 'name',
               render: (matn, yozuv) => (
                    <Space direction="vertical" size="small">
                         {yozuv.image_url ? (
                              <img src={yozuv.image_url} alt={yozuv.name} className="card-product-image" />
                         ) : (
                              <div className="card-no-image">Rasm yoʻq</div>
                         )}
                         <Text>{yozuv.name || 'Nomaʼlum'}</Text>
                    </Space>
               ),
          },
          { title: 'Hamkor nomi', dataIndex: 'hamkor_nomi', key: 'hamkor_nomi', render: (matn) => matn || '-' },
          { title: 'Hamkor raqami', dataIndex: 'hamkor_raqami', key: 'hamkor_raqami', render: (matn) => matn || '-' },
          { title: 'Kod', dataIndex: 'code', key: 'code' },
          { title: 'Oʻlcham', dataIndex: 'size', key: 'size' },
          {
               title: 'Umumiy vazn (kg)',
               dataIndex: 'total_kg',
               key: 'total_kg',
               render: (matn) => (matn ? matn?.toFixed(2) : '-'),
          },
          { title: 'Dona soni', dataIndex: 'quantity', key: 'quantity' },
          {
               title: 'Quti soni',
               dataIndex: 'box_quantity',
               key: 'box_quantity',
               render: (matn) => (matn ? matn?.toFixed(2) : '-'),
          },
          {
               title: 'Paket soni',
               key: 'package_quantity',
               render: (_, yozuv) => (yozuv?.isPackage ? yozuv?.package_quantity?.toFixed(2) : '-'),
          },
          { title: 'Valyuta', dataIndex: 'currency', key: 'currency' },
          {
               title: 'Sotib olish narxi',
               dataIndex: 'purchasePrice',
               key: 'purchasePrice',
               render: (matn, yozuv) => `${yozuv.purchasePrice?.value || '-'}`,
          },
          {
               title: 'Sotish narxi',
               dataIndex: 'sellingPrice',
               key: 'sellingPrice',
               render: (matn, yozuv) => `${(yozuv.sellingPrice?.value)?.toFixed(2) || '-'}`,
          },
          {
               title: 'Ombor',
               dataIndex: 'warehouse',
               key: 'warehouse',
               render: (matn, yozuv) => yozuv?.warehouse?.name || '-',
          },
          { title: 'Shtrix kod', dataIndex: 'barcode', key: 'barcode' },
          { title: 'Kategoriya', dataIndex: 'category', key: 'category' },
     ];

     const kartaBosish = (hamkor) => {
          setTanlanganHamkor(hamkor);
          setModalKoʻrinadi(true);
     };

     const modalYopish = () => {
          setModalKoʻrinadi(false);
          setTanlanganHamkor(null);
     };
     console.log(unikalHamkorlar);

     return (
          <div style={{ padding: '24px', background: '#f0f2f5', overflowX: "auto" }}>
               <Title level={2} style={{ color: '#001529', marginBottom: '24px' }}>
                    Yetkazib beruvchilar
               </Title>
               <Space style={{ marginBottom: '24px' }}>
                    <Input
                         style={{ width: '300px' }}
                         placeholder="Ismini kiriting"
                         value={searchName}
                         onChange={(e) => setSearchName(e.target.value)}
                    />
                    <Input
                         style={{ width: '200px' }}
                         placeholder="Telefon raqam kiriting"
                         value={searchNumber}
                         onChange={(e) => setSearchNumber(e.target.value)}
                    />
                    <Select value={selectedAddress} onChange={(value) => setSelectedAddress(value)} placeholder={'Manzil bo\'yicha saralash'} style={{ width: "300px" }}>
                         <Select.Option value="">Barchasi</Select.Option>
                         {
                              unikalManzillar.map((manzil, indeks) => (
                                   <Select.Option key={indeks} value={manzil}>
                                        {manzil}
                                   </Select.Option>
                              ))
                         }
                    </Select>
               </Space>
               <Row gutter={[16, 16]}>
                    {unikalHamkorlar?.filter((h) => selectedAddress ? h.manzil === selectedAddress : true).map((hamkor, indeks) => (
                         <Col xs={24} sm={12} md={8} lg={6} key={indeks}>
                              <Card
                                   hoverable
                                   onClick={() => kartaBosish(hamkor)}
                                   style={{
                                        background: '#fff',
                                        border: `1px solid ${tanlanganHamkor?.nom === hamkor.nom ? '#001529' : '#d9d9d9'}`,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                   }}
                                   headStyle={{ background: '#001529', color: '#fff' }}
                                   title={hamkor.nom}
                              >
                                   <Text>Raqam: {hamkor.raqam}</Text>
                              </Card>
                         </Col>
                    ))}
               </Row>
               <Modal
                    title={
                         <Space>
                              <MdScale style={{ fontSize: '20px', color: '#001529' }} />
                              <Text strong style={{ color: '#001529' }}>
                                   {tanlanganHamkor?.nom} - Mahsulotlar haqida maʼlumot
                              </Text>
                         </Space>
                    }
                    open={modalKoʻrinadi}
                    onCancel={modalYopish}
                    footer={null}
                    width={1600}
                    bodyStyle={{ padding: '16px' }}
               >
                    <Table
                         columns={ustunlar}
                         dataSource={filtrlanganMahsulotlar}
                         rowKey="_id"
                         pagination={{ pageSize: 10 }}
                         scroll={{ x: 'max-content' }}
                         style={{ border: '1px solid #f0f0f0' }}
                    />
               </Modal>
          </div>
     );
};

export default Partner;