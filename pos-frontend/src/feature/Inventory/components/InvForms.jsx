import { Button, Dropdown, FormPage, FormCard, FormGrid, FormActions } from "@/components";
import Upload from "@/components/Forms/Upload";
import Input from "@/components/Shared/Inputs/Input";
import useFetch from "@/utils/hooks/useFetch";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loading from "@/pages/Loading/Landing";
import CheckImgSize from "@/utils/helpers/CheckImgSize";
import { addProductCategory } from "@/store/Reducer/inventotySlice";

const statusList = [{ id: 1, name: 'Active', value: 'active' }, { id: 2, name: 'Deactive', value: 'deactive' }];

export default function InvForms() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useSelector((state) => state.authStore);
  const { productCategory } = useSelector((state) => state.inventoryStore);
  const { get, post, patch } = useFetch();
  // const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState({ main: true, local: false });
  const [activeStatus, setActiveStatus] = useState(statusList[0]);
  const [category, setCategory] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (params?.id !== "addnew") {
      setLoading({ main: true, ...loading });
      get(`/product/${params?.id}`).then((res) => {
        if (res?.status === 200) {
          ['name', 'description', 'productCode', 'buyingPrice', 'sellingPrice', 'tax', 'unit'].forEach((k) => setValue(k, res.data[k] || ''))
          setValue("category", res?.data?.category?.id);
          setStock(res?.data?.stock);
          setImage(res?.data?.image);
          setCategory(res?.data?.category);
          setActiveStatus(statusList.find((s) => s.value === res.data.status));
        } else navigate('/not-found')
      }).catch(error => console.log(error)).finally(() => setLoading({ main: false, local: false }));
    } else {
      const defaultCat = productCategory.find((d) => ['others', 'other'].includes(d.name.toLowerCase()));
      setCategory(defaultCat);
      setValue('category', defaultCat?.id);
      setLoading({ main: false, local: false });
    }
  }, [params?.id]);

  const handleNewCategory = (name) => {
    post("/category", { name, store: user?.store?.id }).then((res) => {
      if (res.status === 200) dispatch(addProductCategory(res?.data));
    }).catch(() => toast.error('Something went wrong!'));
  };

  const onSubmit = (data) => {
    try {
      setLoading({ ...loading, local: true });
      delete data?.image;
      data.store = user?.store?.id;
      data.status = activeStatus.value;
      data.stock = stock;
      const formData = new FormData();
      if (typeof image !== "string") formData.append("image", image);
      formData.append("data", JSON.stringify(data));
      if (params?.id === "addnew") {
        post("/product", formData).then((res) => {
          if (res?.status === 200) {
            toast.success("Product added to inventory");
            navigate(-1);
          }
          else toast.error(res?.message);
        }).catch(error => { toast.error('Something went wrong!'); console.error(error) })
          .finally(() => setLoading({ ...loading, local: false }))
      } else {
        patch(`/product/${params?.id}`, formData).then((res) => {
          if (!res.data) return toast.error('Something went wrong!');
          if (res.status === 200) {
            toast.success("Successfully Updated");
            // setStock(res?.data?.stock);
            navigate(-1);
          }
        }).catch(error => { toast.error('Something went wrong!'); console.error(error) })
          .finally(() => setLoading({ ...loading, local: false }))
      }
    } catch (error) {
      console.log(error);
      setLoading({ ...loading, local: false })
    }

  };
  // console.log(image);
  if (loading.main) return <Loading />;
  return (
    <FormPage title={params?.id !== "addnew" ? 'Edit Item' : 'Add New Item'} onBack={() => navigate("/inventory")}>
      <div className="relative">
      <FormCard onSubmit={handleSubmit(onSubmit)}>
        <Upload
          image={image}
          setImage={setImage}
          register={{
            ...register("image", {
              onChange: (e) => CheckImgSize(e, setImage),
            }),
          }}
        />
        <FormGrid>

        <div className="sm:col-span-2">
        <Input
          label="Item Name"
          placeholder="Type item name"
          rest={{ ...register("name", { required: true }) }}
          error={errors["name"]}
        />
        </div>
        <>
          <Input
            label="Description"
            placeholder="Type Description"
            rest={{ ...register("description") }}
            error={errors["description"]}
          />
          
          <Input
            label="Product Code"
            placeholder="Product code"
            rest={{ ...register("productCode", { required: true }) }}
            error={errors["productCode"]}
          />
        </>
        <>
          
          <Input
            style="secondary"
            placeholder="0"
            value={stock}
            type="quantity"
            onChange={(e) => setStock(e.target.value)}
            label="Stock"
            className="px-5 w-full"
          />
          <Input
            label="Unit"
            placeholder="Type Unit"
            rest={{ ...register("unit") }}
            error={errors["unit"]}
          />
        </>

        <>
          <Input
            label="Buying Price"
            placeholder="Type buying price"
            rest={{
              ...register("buyingPrice", {
                // valueAsNumber: true,
                validate: (value) => value > 0,
              })
            }}
            error={errors["buyingPrice"]}
          />

          <Input
            label="Selling Price"
            placeholder="Type Selling price"
            rest={{
              ...register("sellingPrice", {
                // valueAsNumber: true,
                validate: (value) => value > 0,
              })
            }}
            error={errors["sellingPrice"]}
          />

        </>
        <>
          <Dropdown
            type="input"
            other={true}
            data={productCategory}
            label="Category"
            className="w-full"
            addCt
            onAdd={(e) => handleNewCategory(e)}
            onChange={(e) => setValue("category", e.id)}
            defaultValue={category}
            modalClass='w-full shadow-md'
          />

          <Dropdown
            defaultValue={activeStatus}
            type='input'
            data={statusList}
            label='Status'
            className='w-full'
            onChange={(value) => setActiveStatus(value)} />

        </>
        </FormGrid>
        <FormActions>
          <Button
            style="outline"
            className="!py-1.5 !px-4 !text-sm"
            onClick={() => {
              clearErrors();
              reset();
            }}
          >
            Clear
          </Button>
          <Button
            style="secondary"
            type="submit"
            className="!py-1.5 !px-4 !text-sm"
            onClick={() => clearErrors()}
          >
            Save
          </Button>
        </FormActions>
      </FormCard>
      {loading.local ? <div className="absolute top-0 right-0 left-0 bottom-0 overflow-hidden"><Loading bg /> </div> : ''}
      </div>
    </FormPage>
  );
}
