import { Delete } from '@/assets/SvgComponents';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';

export default function ItemBill({ data, updateItem, removeItem }) {
  const { quantity = 0, item = '', discount = 0, percentageDiscount = false } = data;
  const { tax } = useSelector((state) => ({
    tax: state.storeStore.store.taxPercent,
  }), shallowEqual);
  const { id = '', name = '', sellingPrice = 0, stock = 0 } = item || {};

  const currency = useSelector((state) => state.storeStore?.store?.currency || { symbol: "$" });


  function onChangeHandler(ev) {
    if (ev.target.name === 'discountType') {
      updateItem(id, 0, 'discount');
      return updateItem(id, ev.target.checked, ev.target.name);
    }
    const value = Number(ev.target.value) || 0;
    return updateItem(id, value, ev.target.name);
  }

  const unitNet = sellingPrice - (percentageDiscount ? (sellingPrice * (Number(discount) / 100)) : Number(discount));
  const lineNet = unitNet * quantity;
  const lineTax = lineNet * (tax / 100);
  const inputCls = "w-full h-8 rounded-lg border border-border px-2 text-sm text-primary outline-none focus:border-primary4";

  return (
    <div key={id} className="rounded-lg border border-border p-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary line-clamp-1" title={name}>{name}</p>
        <button type="button" aria-label="Remove item" onClick={() => removeItem(id)} className="h-7 w-7 shrink-0 grid place-items-center rounded-full hover:bg-light active:scale-95">
          <Delete className="h-4 w-4 hover:stroke-red stroke-black cursor-pointer" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs text-label">Qty
          <input
            min={1}
            max={stock}
            name="quantity"
            type='number'
            value={quantity}
            onFocus={(ev) => ev.target.select()}
            onChange={(ev) => {
              if (ev.target.value === '' || ((stock >= Number(ev.target.value)) && (Number(ev.target.value) >= 1))) {
                onChangeHandler(ev)
              }
            }}
            className={inputCls}
          />
        </label>
        <label className="text-xs text-label col-span-2">
          <span className="flex items-center justify-between">Discount ({percentageDiscount ? "%" : currency.symbol})
            <input onChange={(ev) => onChangeHandler(ev)} checked={percentageDiscount} type="checkbox" name="discountType" title="Percent discount" className="accent-primary2 cursor-pointer" />
          </span>
          <input
            min={0}
            name="discount"
            type='number'
            value={discount}
            onFocus={(ev) => ev.target.select()}
            onChange={(ev) => {
              if (ev.target.value === '' || (ev.target.value >= 0) && (percentageDiscount ? (ev.target.value <= 100) : (ev.target.value <= sellingPrice))) {
                onChangeHandler(ev)
              }
            }}
            className={inputCls}
          />
        </label>
      </div>
      <div className="flex items-center justify-between text-xs text-label">
        <span>{currency.symbol} {sellingPrice.toFixed(2)} &middot; Tax {tax}%: {currency.symbol} {lineTax.toFixed(2)}</span>
        <span className="text-sm font-semibold text-primary2">{currency.symbol} {(lineNet + lineTax).toFixed(2)}</span>
      </div>
    </div>
  );
}
