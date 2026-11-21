import React, { useEffect, useState } from 'react';
import DefaultImage from "../../../assets/Images/imageDefault.png";
import { useSelector } from 'react-redux';
const ProductCard = ({ data = {}, cardHandler, }) => {
    const { sellingPrice, image, name, stock, unit } = data;
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState(true);
    const currency = useSelector((state) => state.storeStore?.store?.currency || { symbol: "$" });

    const quantityHandler = (event) => {
        if (event.target.value <= stock) {
            setQuantity(event.target.value);
        } else {
            return;
        }
    }
    const discountHandler = (event) => {
        if (discountType && event.target.value <= 100) {
            setDiscount(Math.abs(event.target.value));
        } else if (event.target.value <= sellingPrice) {
            setDiscount(Math.abs(event.target.value));
        }
    }

    const cartHandler = () => {
        cardHandler({ item: data, discount: Number(discount), quantity: Number(quantity), percentageDiscount: discountType });

    }

    const discountChange = (e) => {
        setDiscountType(e.target.checked);
    }

    useEffect(() => {
        setDiscount(0);
    }, [discountType]);

    const out = stock <= 0;
    return (
        <div className={`rounded-xl border border-border p-2.5 flex flex-col gap-2 bg-white select-none ${out ? 'opacity-60' : 'hover:border-primary4'}`}>
            <div className="flex gap-2.5">
                <img className='w-14 h-14 rounded-lg object-cover shrink-0' src={`${import.meta.env.VITE_SERVER_URL}/file/${image}`} alt="" onError={(e) => e.target.src = DefaultImage} />
                <div className="min-w-0 grow">
                    <p className="text-sm font-semibold text-primary line-clamp-2 leading-tight" title={name}>{name || ""}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-sm font-semibold text-primary2">{currency.symbol} {Number(sellingPrice || 0).toFixed(2)}</p>
                        <p className={`text-xs ${out ? 'text-danger' : 'text-label'}`}>{out ? 'Out of stock' : `${stock} ${unit || ""}`}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-label">Qty
                    <input type="number" min={1} max={stock} value={quantity} disabled={out} onFocus={(e) => e.target.select()} onChange={quantityHandler} className="mt-0.5 w-full h-8 rounded-lg border border-border px-2 text-sm text-primary outline-none focus:border-primary4 disabled:bg-light" />
                </label>
                <label className="text-xs text-label">
                    <span className="flex items-center justify-between">Disc ({discountType ? '%' : currency.symbol})
                        <input id={`discountType-${data.id}`} defaultChecked={true} onChange={discountChange} disabled={out} type="checkbox" title="Percent discount" className="accent-primary2" />
                    </span>
                    <input type="number" min={0} max={discountType ? 100 : sellingPrice} value={discount} disabled={out} onFocus={(e) => e.target.select()} onChange={discountHandler} className="mt-0.5 w-full h-8 rounded-lg border border-border px-2 text-sm text-primary outline-none focus:border-primary4 disabled:bg-light" />
                </label>
            </div>
            <button type="button" onClick={cartHandler} disabled={out} className="w-full h-8 rounded-full bg-primary2 text-white text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">Add to Cart</button>
        </div>
    );
};

export default ProductCard;