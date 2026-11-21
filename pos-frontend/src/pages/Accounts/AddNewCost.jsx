import { Button, Dropdown, FormPage, FormCard, FormGrid, FormActions } from "@/components";
import Input from "@/components/Shared/Inputs/Input";
import useFetch from "@/utils/hooks/useFetch";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loading from "@/pages/Loading/Landing";

const PURPOSE_DATA = [
  { id: 1, name: 'Sell', value: 'sell' },
  { id: 2, name: 'Restock', value: 'restock' },
  { id: 3, name: 'Expense', value: 'expense' },
  { id: 4, name: 'Others', value: 'others' },

]
const TYPE_DATA = [
  { id: 1, name: 'Revenue', value: 'revenue' },
  { id: 2, name: 'Expense', value: 'expense' },

]

export default function AddNewCost() {
  const navigate = useNavigate();
  const { post, loading } = useFetch();
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    if (data.purpose === undefined) setError('purpose', { message: 'This field is required' });
    else if (quantity < 1) setError('quantity', { message: 'This field is required' });
    else if (data.purpose === 'others' && (data.type === null || data.type === undefined)) setError('type', { message: 'This field is required' });
    else {
      if (purpose !== 'others') {
        setValue('type', null);
        delete data.type;
      }
      //replace Endpoint
      post(`/custom-bill`, { ...data, quantity }).then(res => res?.status === 200 ? (toast.success('New Cost added Successfully'), navigate(-1)) : toast.error(res.message)).catch(error => console.log(error));
    }
  };

  if (loading === true) return <Loading />

  return (
    <FormPage title="Add New Cost" onBack={() => navigate(-1)}>
      <FormCard onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>

        <Input
          label="Item Name"
          placeholder="Type item name"
          rest={{ ...register("name", { required: true }) }}
          error={errors["name"]}
        />
        <Dropdown
          type="input"
          other={true}
          data={PURPOSE_DATA}
          label="Purpose"
          className="w-full"

          onChange={(e) => { setValue("purpose", e.value); setPurpose(e.value) }}
          error={errors["purpose"]}
        />
        {
          purpose === 'others' ? <Dropdown
            type="input"
            other={true}
            data={TYPE_DATA}
            label="Type"
            className="w-full"

            onChange={(e) => setValue("type", e.value)}
            error={errors["type"]}
          /> : ''

        }
        <Input
          label="Cost"
          type='number'
          placeholder="Total cost/unit (including vat)"
          rest={{ ...register("cost", { required: true }) }}
          error={errors["cost"]}
        />
        <Input
          style="secondary"
          placeholder="10"
          type="quantity"
          onChange={(e) => setQuantity(e.target.value)}
          label="Quantity"
          value={quantity}
          className="px-5"
          error={errors['quantity']}
        />

      </FormGrid>
        <FormActions>
          <Button
            style="outline"
            className="!py-1.5 !px-4 !text-sm"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            style="secondary"
            type="submit"
            className="!py-1.5 !px-4 !text-sm"
            rest={{ disabled: loading }}
            onClick={() => clearErrors()}
          >
            Save
          </Button>
        </FormActions>
      </FormCard>
    </FormPage>
  );
}
