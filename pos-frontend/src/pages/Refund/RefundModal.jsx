import React, { useEffect, useState } from "react";
import closeIco from "../../assets/Icons/closeV2.svg";
import { Button } from "@/components";
import uuid from "react-uuid";
import useFetch from "@/utils/hooks/useFetch";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const RefundModal = ({ modal = null, setModal = () => { }, }) => {
  const [products, setProducts] = useState({});
  const [subTotal, setSubTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const { patch } = useFetch();
  const navigate = useNavigate();

  const currency = useSelector((state) => state.storeStore?.store?.currency || { symbol: "$" });

  useEffect(() => {
    modal.products.forEach(prod => {
      setSubTotal(modal.subTotal);
      setTax(modal.totalTax);
      setDiscount(modal.totalDiscount);

      setProducts(prev => {
        return { ...prev, [uuid()]: { item: prod?.item, prevQt: prod.quantity, quantity: prod.quantity, discount: prod.discount, percentageDiscount: prod.percentageDiscount } }
      })
    })

  }, []);
  const handleChange = (key, value) => {

    setProducts(prev => {
      prev[key].quantity = value;
      return { ...prev }
    })
  };
  const handleSubmit = () => {

    const data = {};
    Object.keys(products).forEach(key => {
      data[products[key].item.id] = Number(products[key].quantity);
      // if(products[key].quantity==='' ||products[key].quantity===0 ) {
      //     data[products[key].item.id]=products[key].prevQt;
      // }
      // else{
      //     const difference = products[key].prevQt-products[key].quantity;
      //     data[products[key].item.id]=difference

      // }

    })


    patch(`/sales/refund?sales=${modal.id}`, data).then(res => {
      if (res?.status === 200) {
        toast.success('Successfully Updated');
        // handleSuccess()
        navigate(`/bill-print`, { state: { receiptData: res?.data } });

      }
      else {
        toast.error(res?.message)
      }
    }).catch(error => console.log(error));




  }

  useEffect(() => {
    let dis = 0;
    let total = 0;
    Object.keys(products).forEach(key => {
      if (products[key].percentageDiscount) {
        dis += (products[key].item.sellingPrice * products[key].quantity) * (products[key].discount / 100);

      }
      else dis += products[key].discount * products[key].quantity;

      total += products[key].quantity * products[key].item.sellingPrice;
    });
    setDiscount(dis);
    setSubTotal(total);
    setTax(((total - dis) * modal?.store.taxPercent) / 100);



  }, [products])







  return (
    <div className="fixed inset-0 bg-primary1/70 z-50 flex items-center justify-center p-3" onClick={() => setModal(null)}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl p-4 text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-lg font-semibold text-primary"># {String(modal?.salesId).padStart(4, '0')}</p>
            <p className="text-xs text-label">{modal?.customerName} &middot; {new Date(modal?.createdAt).toLocaleDateString()}</p>
          </div>
          <button type="button" aria-label="Close" onClick={() => setModal(null)} className="h-9 w-9 grid place-items-center rounded-full hover:bg-light active:scale-95 shrink-0">
            <img className="h-4 w-4" src={closeIco} alt="" />
          </button>
        </div>
        <div className="border border-border rounded-lg overflow-auto max-h-64">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-left text-primary bg-light"><th className="p-2 w-8">#</th><th className="p-2">Product</th><th className="p-2 whitespace-nowrap">Unit price</th><th className="p-2">Qty</th></tr>
            </thead>
            <tbody>
              {
                Object.keys(products).map((key, index) => <tr key={index} className="border-t border-border">
                  <td className="px-2 py-1.5">{index + 1}</td>
                  <td className="px-2 py-1.5">{products[key].item?.name}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">{currency.symbol} {Number(products[key].item?.sellingPrice || 0).toFixed(2)}</td>
                  <td className="px-2 py-1.5"><input className="outline-none border border-border focus:border-primary4 rounded-md px-2 py-1 w-16 text-sm" type="number" min="0" defaultValue={products[key].quantity} onChange={(e) => handleChange(key, e.target.value)} /></td>
                </tr>)
              }
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-1 text-sm text-primary">
          <div className="flex justify-between"><span className="font-semibold">Subtotal</span><span>{currency.symbol} {subTotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="font-semibold">Discount</span><span>{currency.symbol} {discount.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="font-semibold">Tax</span><span>{currency.symbol} {tax.toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-border pt-1 text-base font-semibold"><span>Net total</span><span>{currency.symbol} {(subTotal + tax - discount).toFixed(2)}</span></div>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button className="flex-1 sm:flex-none justify-center !py-1.5 !px-4 !text-sm" style="outline" onClick={() => setModal(null)}>Cancel</Button>
          <Button type="submit" className={`flex-1 sm:flex-none justify-center !py-1.5 !px-4 !text-sm ${''}`} style="secondary" onClick={() => handleSubmit()}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
