import React, { useState } from "react";
import closeIco from "../../../assets/Icons/closeV2.svg";
import DropDownV2 from "@/components/Shared/Dropdown/DropDownV2";
import useFetch from "@/utils/hooks/useFetch";
import toast from "react-hot-toast";
import Input from "@/components/Shared/Inputs/Input";
import { Button } from "@/components";

const RestockModal = ({ setModal = () => { }, handleSuccess = () => { } }) => {
  const [data, setData] = useState([]);
  const { get, patch, loading } = useFetch();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [errors, setErrors] = useState({
    prodError: null,
    qtError: null,
    buyingError: null,
    sellingError: null,
  });
  const [buyingPrice, setByiungPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [searchText, setSearchText] = useState(true);

  const handleSearch = (key) => {
    get(`/product?search=${key}`).then(res => {
      if (res?.status === 200) {
        setData(res?.data?.docs)
      }
      else {
        toast.error(res.message)
      }



    }).catch(error => console.log(error));


  }

  const handleSubmit = () => {
    setErrors({
      prodError: null,
      qtError: null,
      buyingError: null,
      sellingError: null,
    });
    if (product === null) setErrors(prev => {
      prev.prodError = true;
      return { ...prev }
    });
    else if (quantity < 1) setErrors(prev => {
      prev.qtError = true;
      return { ...prev }
    });
    else if (buyingPrice < 1 || buyingPrice === '') setErrors(prev => {
      prev.buyingError = true;
      return { ...prev }
    });
    else if (sellingPrice < 1 || sellingPrice === '') setErrors(prev => {
      prev.sellingError = true;
      return { ...prev }
    });

    else {


      patch(`/product/restock/${product}`, { stock: Number(quantity), buyingPrice: Number(buyingPrice), sellingPrice: Number(sellingPrice) }).then(res => {
        if (res?.status === 200) {
          handleSuccess();
          toast.success('Successfully updated');
          setProduct(null);
          setQuantity(0);
          setByiungPrice('');
          setSellingPrice('');
          setSearchText(prev => !prev);
        }
        else {
          toast.error(res.message.reason);
        }
      }).catch(error => console.log(error));
    }


  }

  const handleSelect = (id) => {
    setProduct(id);
    if (id) {
      get(`/product/${id}`).then(res => {
        if (res?.status === 200) {
          setByiungPrice(res?.data?.buyingPrice);
          setSellingPrice(res?.data?.sellingPrice);

        }
      })

    }
    else {
      setByiungPrice('');
      setSellingPrice('');

    }
  }


  return (
    <div className="fixed inset-0 bg-primary1/70 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 bg-white shadow-xs rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-primary">Restock</h2>
            <button type="button" className="p-2 -mr-2 rounded-full hover:bg-light" onClick={() => setModal(false)}>
              <img src={closeIco} alt="Close" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><DropDownV2
              label="Search your product"
              onChange={handleSearch}
              data={data}
              getValue={handleSelect}
              error={errors.prodError}
              searchText={searchText}

            /></div>


            <div className="sm:col-span-2"><Input
              style="secondary"
              placeholder="10"
              type="quantity"
              onChange={(e) => {
                setQuantity(e.target.value);
              }}
              label="Quantity"
              value={quantity}
              className="px-4 w-full"
              error={errors.qtError}
            /></div>
            <Input
              style="secondary"
              placeholder="0"
              type="number"
              onChange={(e) => {
                setByiungPrice(e.target.value);
              }}
              label="Buying Price"
              className="px-4 w-full"
              error={errors.buyingError}
              value={buyingPrice}
            />
            <Input
              style="secondary"
              placeholder="0"
              type="number"
              onChange={(e) => {
                setSellingPrice(e.target.value);
              }}
              label="Selling Price"
              className="px-4 w-full"
              error={errors.sellingError}
              value={sellingPrice}

            />
          </div>

          <div className="flex justify-end items-center gap-2 pt-4">
            <Button
              className="flex items-center justify-center !py-1.5 !px-4 !text-sm"
              style="outline"
              onClick={() => setModal(false)}
            >

              Cancel
            </Button>
            <Button
              rest={{ disabled: loading }}
              className="flex items-center justify-center !py-1.5 !px-4 !text-sm"
              style="secondary"
              onClick={handleSubmit}
            >

              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockModal;
