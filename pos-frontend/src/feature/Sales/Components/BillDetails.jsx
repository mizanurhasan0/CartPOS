import React, { useEffect, useState } from 'react';
import ItemBill from './ItemBill';
import { Button, Radio } from '@/components';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { changeDiscountType, clearCart, removeItem, updateDiscount, updateQty } from '@/store/Reducer/cartSlice';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import useFetch from '@/utils/hooks/useFetch';

export default function BillDetails({ onClose }) {
  const { cart, store, cashier } = useSelector((state) => ({
    cart: state.cartStore.cart,
    cashier: state.authStore.user.id,
    store: state.storeStore.store,
  }), shallowEqual);
  const currency = store.currency || { symbol: '$' };
  const [posData, setPosData] = useState({
    subTotal: 0,
    discount: 0,
    tax: 0,
  });
  const [flat, setFlat] = useState(0);
  const { post, loading } = useFetch();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();


  function handelRremoveItem(id) {
    dispatch(removeItem({ id }));
  }

  function updateItem(id, value, name) {
    if (name === 'quantity') return dispatch(updateQty({ id, quantity: value }));
    else if (name === 'discount') return dispatch(updateDiscount({ id, discount: value }));
    else if (name === 'discountType') return dispatch(changeDiscountType({ id, value: value }));
  }

  function handelNavigate(cart) {
    if (cart.products.length <= 0) return toast.error('No item selected');
    if (cart.customerName === '') cart.customerName = 'customer';
    if (cart.customerPhone === '') cart.customerPhone = 'n/a';
    delete cart.store;
    post("/sales", cart)
      .then((res) => {
        if (res.data) {
          navigate(`/bill-print`, { state: { receiptData: res.data } });
          return dispatch(clearCart());
        }
        return toast.error(res.message);
      })
  }

  useEffect(() => {
    setPosData({
      subTotal: cart.reduce((now, trig) => now + (trig.quantity * (trig.item.sellingPrice)), 0),
      discount: cart.reduce((now, trig) => now + (trig.percentageDiscount ? (((trig?.item?.sellingPrice) * (trig.discount / 100)) * trig.quantity) : trig.discount * trig.quantity), 0),
      tax: cart.reduce((now, trig) => now + (((trig.item.sellingPrice * (store.taxPercent / 100)) * trig.quantity)), 0).toFixed(2),
    });
    const filtred = cart.filter((ech) => ech.quantity > 0);
    setValue('products', filtred.map((ech) => ({ item: ech.item.id, quantity: ech.quantity, discount: ech.discount, percentageDiscount: ech.percentageDiscount || false })));
  }, [cart]);

  useEffect(() => {
    const storeId = store ? store.id : '';
    setValue('store', storeId);
    setValue('cashier', cashier);
    setValue('flatDiscount', flat);
  }, []);

  useEffect(() => {
    if (errors['customerPhone']) toast.error(errors['customerPhone']?.message || 'Phone number not valid');
  }, [errors]);
  const net = posData.subTotal - posData.discount;
  const taxAmt = net * (store.taxPercent / 100);
  const total = net + taxAmt - flat;
  const field = "w-full h-9 rounded-lg border border-border px-3 text-sm text-primary outline-none focus:border-primary4";
  return (
    <form onSubmit={handleSubmit(handelNavigate)} className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <p className="text-base font-semibold text-primary">Bill <span className="text-xs font-normal text-label">{cart.length} items</span></p>
        {onClose && <button type="button" aria-label="Close" onClick={onClose} className="lg:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-light active:scale-95 text-xl leading-none text-primary">&times;</button>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input {...register('customerName')} className={field} placeholder="Customer name" type="text" />
          <input {...register('customerPhone', { pattern: { value: /^[0-9+()]*$/, message: 'Phone number not valid' } })} className={field} placeholder="Phone" type="tel" />
        </div>
        {cart.length > 0
          ? cart.map((ech) => <ItemBill key={ech.item.id} data={ech} removeItem={handelRremoveItem} updateItem={updateItem} />)
          : <p className="text-center text-sm text-label py-8">Cart is empty. Add products to start a bill.</p>}
      </div>
      <div className="border-t border-border p-3 space-y-2 text-sm">
        <div className="space-y-1 text-primary">
          <div className="flex justify-between text-xs"><span>Subtotal</span><span>{currency.symbol} {posData.subTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span>Discount</span><span className="text-danger">- {currency.symbol} {posData.discount.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span>Tax</span><span>{currency.symbol} {taxAmt.toFixed(2)}</span></div>
          <div className="flex justify-between items-center text-xs">
            <span>Flat discount</span>
            <input
              step={0.01}
              name="flatDiscount"
              {...register('flatDiscount', { valueAsNumber: true })}
              value={flat}
              type='number'
              onFocus={(ev) => ev.target.select()}
              onChange={(e) => {
                if ((e.target.value <= Number(((posData.subTotal - posData.discount) + Number((posData.subTotal - posData.discount) * (store.taxPercent / 100)))))) setFlat(Number(e.target.value))
              }}
              className="w-20 h-7 rounded-lg border border-border px-2 text-xs text-right outline-none focus:border-primary4"
            />
          </div>
          <div className="flex justify-between text-base font-semibold pt-1 border-t border-dashed border-border"><span>Total</span><span className="text-primary2">{currency.symbol} {total.toFixed(2)}</span></div>
        </div>
        <div className="text-sm"><Radio onChange={(data) => setValue('paymentMethod', data.value)} data={[{ title: 'Cash', value: 'cash' }, { title: 'Card', value: 'card' }]} /></div>
        <Button rest={{ disabled: loading }} type='submit' style='secondary' className='w-full !py-2 text-sm'>
          {loading ? 'Creating...' : 'Create Bill'}
        </Button>
      </div>
    </form>
  );
}
