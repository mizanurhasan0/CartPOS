import A4 from '@/feature/Bill/A4/A4';
import Thermal from '@/feature/Bill/Thermal/Thermal';
import useFetch from '@/utils/hooks/useFetch';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

export default function PrintPage() {
  const { size = 'a4', id = null } = useParams();
  const { get } = useFetch();
  const [invoice, setInvoice] = useState({});
  const a4ref = useRef(null);
  const componentRef = useRef(null);

  useLayoutEffect(() => {
    const nav = document.getElementById('navBar');
    const sideBar = document.getElementById('sideBar');
    const sideBarT = document.getElementById('sideBar2');

    if (nav) nav.style.display = "none";
    if (sideBar) sideBar.style.display = "none";
    if (sideBarT) sideBarT.style.display = "none";

    if (!id) return 0;
    get(`/sales/${id}`)
      .then((res) => {
        if (!res.data) return console.log('something went wrong');
        setInvoice(() => ({
          invoiceId: res?.data?.invoiceId || 'invoice id',
          cashier: res?.data?.cashier?.fullName || 'cashier',
          customerName: res?.data?.customerName || 'customer name',
          customerPhone: res?.data?.customerPhone || 'customer phone',
          products: res?.data?.products?.map((ech) => ({ id: ech?.item?.id || 'product id', title: ech?.item?.name || 'product name', price: ech?.item?.sellingPrice || 0, total: ((ech?.item?.sellingPrice || 0 * ech?.quantity || 0)), quantity: ech?.quantity || 0 })),
          subTotal: (res?.data?.subTotal - res?.data?.totalTax + res?.data?.totalDiscount).toFixed(2) || 0,
          vat: res?.data?.store.taxPercent,
          vatAmount: res?.data?.totalTax.toFixed(2) || 0,
          discount: res?.data?.totalDiscount.toFixed(2) || 0,
          netAmount: res?.data?.subTotal.toFixed(2) || 0,
          payMethod: res?.data?.paymentMethod || 'payment method',
          storeName: res?.data?.store?.name || 'store name',
          storeAddress: res?.data?.store?.address || 'store address',
          storePhone: res?.data?.store?.phone || 'store phone',
        }))
      })
  }, [id]);
  if (Object.keys(invoice).length === 0) return;
  return (
    <section>
      {
        size === 'a4' ? <A4 a4ref={a4ref} data={invoice} /> : <Thermal thermalref={componentRef} data={invoice} />
      }
    </section>
  );
}
