import A4 from '@/feature/Bill/A4/A4';
import Thermal from '@/feature/Bill/Thermal/Thermal';
import React, { useRef, useState } from 'react';
import { Button, Radio } from '@/components';
import { Arwlfcle } from '@/assets/SvgComponents';
import { useReactToPrint } from 'react-to-print';
import { useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { billTemplateA4, billTemplateThermal } from '@/utils/templates/billTemplate';
const BillPrint = () => {
    const [active, setActive] = useState('thermal');
    const componentRef = useRef(null);
    const a4ref = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    // const handlePrint = useReactToPrint({
    //     content: () => active === 'thermal' ? componentRef.current : a4ref.current,
    // });
    // function electronPrint(page) {
    //     if (page) {
    //         const url = `data:text/html,${encodeURIComponent(page.outerHTML)}`
    //         window.posDesktopApi.print(url);
    //     }
    // }
    const currency = useSelector(
        (state) => state.storeStore?.store?.currency || { symbol: "$" }
      );
    
    const { receiptData } = location.state || '';
    console.log(receiptData);
    const dataOfRecipt = {
        invoiceId: receiptData?.invoiceId || 'invoice id',
        cashier: receiptData?.cashier?.fullName || 'cashier',
        customerName: receiptData?.customerName || 'customer name',
        customerPhone: receiptData?.customerPhone || 'customer phone',
        products: receiptData?.products?.map((ech) => ({ id: ech?.item?.id || 'product id', title: ech?.item?.name || 'product name', price: ech?.item?.sellingPrice || 0, total: ((ech?.item?.sellingPrice || 0 * ech?.quantity || 0)), quantity: ech?.quantity || 0, unit: ech?.item?.unit || "" })),
        subTotal: (receiptData?.subTotal - receiptData?.totalTax + receiptData?.totalDiscount + receiptData?.flatDiscount).toFixed(2) || 0,
        vat: receiptData?.store.taxPercent,
        vatAmount: receiptData?.totalTax.toFixed(2) || 0,
        flatDiscount: receiptData?.flatDiscount.toFixed(2),
        discount: receiptData?.totalDiscount.toFixed(2) || 0,
        netAmount: receiptData?.subTotal.toFixed(2) || 0,
        payMethod: receiptData?.paymentMethod || 'payment method',
        storeName: receiptData?.store?.name || 'store name',
        storeAddress: receiptData?.store?.address || 'store address',
        storePhone: receiptData?.store?.phone || 'store phone',
        currency,
        date:receiptData.createdAt,
    }

    // function handlePrint() {
    //     // const htmlString = 
    //     // window.ReactNativeWebView.postMessage(JSON.stringify());
 
    //     switch (window) {
    //         case window.ReactNativeWebView:
    //             break;
 
    //         case window.posDesktopApi:
    //             window.posDesktopApi.print(active, receiptData.id);
    //             break;
 
    //         default:
    //             useReactToPrint({
    //                 content: () => active === 'thermal' ? componentRef.current : a4ref.current,
    //             });
    //     }
    // }
    // react-to-print v3 reads `contentRef.current` at print time, so a getter keeps
    // the same "pick thermal or A4 node when printing" behaviour as the old `content` fn.
    const printContentRef = {
        get current() {
          return active === "thermal" ? componentRef.current : a4ref.current;
        },
      };
    const webPrint = useReactToPrint({
        contentRef: printContentRef,
      });
      function handlePrint() {
        window?.ReactNativeWebView?.postMessage(
          active === "thermal"
            ? billTemplateThermal(dataOfRecipt)
            : billTemplateA4(dataOfRecipt)
        );
    
        if (window.posDesktopApi) {
          const page = active === "thermal" ? componentRef.current : a4ref.current;
          const url = `data: text/html,${encodeURIComponent(page.outerHTML)}`;
          window.posDesktopApi.print(url);
        } else {
          webPrint();
        }
      }
    return (
        <div className="py-9 md:px-12">
            <div className="flex gap-2 pb-5">
                <h2 className="text-primary2 font-semibold text-2xl">Bill</h2>
                <Button style='small' className='' onClick={() => navigate(-1)}>
                    <div className="flex items-center gap-2">
                        <Arwlfcle className='stroke-white' />
                        <span>Go Back</span>
                    </div>
                </Button>
            </div>
            <div className="xl:hidden py-3">
                <h1 className='font-[600] text-[1.2rem] leading-[1.5rem] pb-3'>Bill Type</h1>
                <div className='flex items-center gap-10'>
                    <Radio data={[{ title: 'Thermal', value: 'thermal' }, { title: 'A4', value: 'a4' }]} onChange={(e) => setActive(e.value)} />

                </div>
            </div>

            <div className='flex gap-8 justify-center pb-12 pt-12 md:pt-0 pointer-events-none xl:pointer-events-auto'>
                <div onClick={() => setActive('thermal')} className={`sm:hidden xl:block shadow-lg cursor-pointer border ${active === 'thermal' ? ' xl:border-primary2 border-white' : 'border-white'}`}>
                    <Thermal thermalref={componentRef} data={dataOfRecipt} />
                </div>
                <div onClick={() => setActive('a4')} style={{maxWidth: '595px'}} className={`w-full shadow-lg cursor-pointer hidden sm:block border ${active === 'a4' ? ' xl:border-primary2 border-white' : 'border-white'}`}>
                    <A4 a4ref={a4ref} data={dataOfRecipt} />
                </div>
            </div>
            <div className="flex gap-6 max-w-[42.5rem] justify-center mx-auto">
                <Button onClick={() => navigate(-1)} style='outline' className='w-full'>Go Back</Button>
                <Button onClick={handlePrint} style='small' className='w-full'>Print</Button>
            </div>
        </div>
    );
};

export default BillPrint;