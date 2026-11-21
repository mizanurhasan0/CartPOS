import React from 'react';
import Header from '../Components/Header';
import { formatDate, formatTimeWithAMPM } from '@/utils/helpers/dateFormatter';
import Footer from '../Components/Footer';
import { useSelector } from 'react-redux';
const A4 = ({ data, a4ref }) => {
    console.log(data)
    const currency = useSelector((state) => state.storeStore?.store?.currency || { symbol: "$" });
    const { payMethod, flatDiscount, customerName, customerPhone, products, subTotal, vat, vatAmount, discount, netAmount, storeName, storeAddress, storePhone, invoiceId, cashier } = data;
    return (
        <div ref={a4ref} style={{ width: '85%', margin: 'auto', paddingTop:'20px',  display: 'grid', gridGap: '12px', }}>
            <Header storeDetails={{ storeName, storeAddress, storePhone }} />
            <p style={{ color: '#000000', margin: 0, fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>Sales Receipt</p>
            <div style={{ fontSize: '10px', color: '#000000', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                <div >
                    <p style={{ margin: 0 }} >Date: {formatDate(data.date)}</p>
                    <p style={{ margin: 0 }} >ID: {invoiceId}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }} >Time: {formatTimeWithAMPM(data.date)}</p>
                    <p style={{ margin: 0 }} >Cashier: {cashier}</p>
                </div>
            </div>
            <div style={{ color: '#000000', margin: 0, fontSize: '10px', fontWeight: '600' }} >
                <p style={{ margin: 0 }}>Customer Name: {customerName.toUpperCase() || ''}</p>
                <p style={{ margin: 0 }} >{customerPhone.toUpperCase() || ''}</p>
            </div>
            <div >
                <table style={{ width: '100%' }}  >
                    <thead >
                        <tr style={{ color: '#000000', fontSize: '12px', fontWeight: '600', borderRadius: '8px' }} >
                            <td></td>
                            <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0', borderTop: '1px dashed #E2E8F0',borderLeft: '1px dashed #E2E8F0' }}>SL No.</td>
                            <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0', borderTop: '1px dashed #E2E8F0' }}>Item / Code</td>
                            <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0', borderTop: '1px dashed #E2E8F0' }}>Price</td>
                            <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0', borderTop: '1px dashed #E2E8F0' }}>Qty</td>
                            <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', textAlign:'right', borderBottom: '1px dashed #E2E8F0', borderTop: '1px dashed #E2E8F0', borderRight: '1px dashed #E2E8F0' }}>Total</td>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((item, index) => {
                            return (
                                <tr key={index} style={{ color: '#000000', fontSize: '12px' }}>
                                    <td></td>
                                    <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0' }}>{index + 1}</td>
                                    <td style={{ padding: '8px 8px',  borderBottom: '1px dashed #E2E8F0'}}>{item?.title?.slice(0, 40)}</td>
                                    <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0' }}>{currency.symbol} {item?.price}</td>
                                    <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: '1px dashed #E2E8F0' }}>{item?.quantity} {item?.unit || ""}</td>
                                    <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', textAlign:'right', borderBottom: '1px dashed #E2E8F0' }}>{currency.symbol} {(item.total * item.quantity).toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div style={{ fontSize: '12px', color: '#000000', display: 'grid', gap: '2px', paddingTop: '3px', paddingLeft: '2px', borderBottom: '1px dashed #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>Total</p>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }} >{currency.symbol} {subTotal || 0}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>VAT ({vat}%)</p>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }} >{currency.symbol} {vatAmount || 0}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>Discount</p>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }} >{currency.symbol} {discount || 0}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>Flat Discount</p>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }} >{currency.symbol} {flatDiscount || 0}</p>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#000000',
                    paddingLeft: '2px',
                    marginTop: '4px'
                }}>
                    <p style={{ margin: 0 }}>Net Amount</p>
                    <p style={{
                        border: '1px solid #000000',
                        padding: '2px 4px',
                        whiteSpace: 'nowrap',
                        borderRadius: '4px',
                        marginRight: '0px'
                    }}>{currency.symbol} {netAmount || 0}</p>
                </div>
            </div>
            <div style={{
                fontSize: '12px',
                color: '#000000',
                display: 'grid',
                gap: '2px',
                paddingLeft: '2px',
                paddingBottom: '4px',
                borderBottom: '1px dashed #E2E8F0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0 }}>Paid By</p>
                    <p style={{ margin: 0 }}>{payMethod.toUpperCase()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0 }}>Paid By Card</p>
                    <p style={{ margin: 0, whiteSpace: 'nowrap' }}>{currency.symbol} {payMethod === 'card' ? netAmount || 0 : 0}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0 }}>Paid By Cash</p>
                    <p style={{ margin: 0, whiteSpace: 'nowrap' }}>{currency.symbol} {payMethod === 'cash' ? netAmount || 0 : 0}</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default A4;