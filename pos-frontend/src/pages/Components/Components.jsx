import React, { useState } from 'react'
import { useGetAllProductsQuery, useGetProductQuery } from '@/services/Api';
import { Button, CardWrapper, Modal, MultipleCard, ProductCard, Radio, SingleCard } from '@/components';
import toast from 'react-hot-toast';
import useFetch from '@/utils/hooks/useFetch';
import Input from '@/components/Shared/Inputs/Input';
import Dropdown from '@/components/Shared/Dropdown/Dropdown';
import { billsData, dropdownData, historyTableAdmin, historyTableSuperAdmin, inventoryTable, itemsTable, organizationTable, productCardData, salesTable, storeTable, userTableData } from '@/db/UserData';
import Switch from '@/components/Shared/Switch/Switch';
import Loader from '../Loading/Landing';
import Table from '@/components/Shared/Table/Table';
import Delete from '../../assets/Icons/delete.svg?react';
import SaveIcon from '../../assets/Icons/save.svg?react';
import CartBlue from '../../assets/Icons/cartBlue.svg?react';
import Success from '../../assets/Icons/success.svg?react';
import ReactApexChart from 'react-apexcharts';
// chart data
const data = {
  day: {
    categories: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
    series: [
      {
        name: "Sales",
        data: [1, 2, 3, 5, 4, 2, 3, 2, 1, 2, 1, 3, 4, 1, 2, 3, 7, 4, 5, 2, 3, 1, 3, 4],
      },
    ],
    color: '#023535',
    background: 'bg-[#023535]',
  },
  Weekly: {
    categories: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "fri"],
    series: [
      {
        name: "Sales",
        data: [1, 2, 3, 5, 4, 2, 5],
      },
    ],
    color: '#023535',
    background: 'bg-[#023535]',
  },
  month: {
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    series: [
      {
        name: "Sales",
        data: [0, 10, 20, 10, 20, 30, 20, 30, 20, 10, 20, 90],
      },
    ],
    color: '#015958',
    background: 'bg-[#015958]',
  },
  year: {
    categories: ["2020", "2021", "2022", "2023"],
    series: [
      {
        name: "Sales",
        data: [100, 200, 150, 300],
      },
    ],
    color: '#008F8C',
    background: 'bg-[#008F8C]',
  },
};
const Components = () => {
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [modal3, setModal3] = useState(false);
  // const { data, isError, isLoading, } = useGetAllProductsQuery();
  // const { data: search } = useGetProductQuery('iphone')
  const { data: fetchData, loading, error, get } = useFetch();
  const [quantity, setQuantity] = useState(10);
  const quantityHandler = (event) => {
    setQuantity(event.target.value);
  }

  const modalHandler = () => {
    setModal(false)
  }
  const modalHandler2 = () => {
    setModal2(false)
  }
  const modalHandler3 = () => {
    setModal3(false)
  }
  // api wrapper
  const fetchHandler = async () => {
    await get('https://dummyjson.com/products');
    console.log(fetchData, loading, error)
  }
  // Switch Hanlder
  const handleSwitchChange = (id, isChecked) => {
    console.log(`Switch with ID ${id} is now ${isChecked ? 'checked' : 'unchecked'}`);
  };
  return (<>
    <div className="flex  gap-2 flex-col container mx-auto">
      <p className="">button</p>
      <Button style='primary'>Button</Button>
      <Button style='secondary' className='text-sm'>Button</Button>
      <Button style='small' className=''>Button</Button>
      <Button style='outline' className=''>Button</Button>
      <p>Input</p>
      <Input style='primary' placeholder='hello world' error={true} label='input small' size='sm' />
      <Input style='secondary' placeholder='hello world' label='input medium' size='md' />
      <Input style='secondary' placeholder='hello world' label='input large' size='lg' />
      <Input style='secondary' placeholder='hello world' type='quantity' onChange={quantityHandler} label='Quantity' value={quantity} size='lg' />
      <p>search</p>
      <Input style='secondary' placeholder='search...' type='search' label='hello world' size='lg' />
      <Input style='secondary' placeholder='search...' type='search' label='hello world' size='md' />
      <Input style='secondary' placeholder='search...' type='search' label='hello world' size='sm' />
      <Dropdown data={dropdownData} className='w-fit bg-' />
      <Dropdown type='input' other={true} data={dropdownData} label='Select' className='w-full' />
      <p>Switch</p>
      <Switch id="exampleSwitch" defaultChecked={true} onChange={handleSwitchChange} />
      <p>Radio button</p>
      <Radio data={[{ title: 'Pay with Cash', value: 'cash' }, { title: 'Pay with Card', value: 'card' }]} />
      {/* <Loader /> */}
      <h3>Super Admin tables</h3>
      <p>Store Table</p>
      <Table role='superAdmin' type={'store'} data={storeTable} Edit />
      <p>Items Table</p>
      <Table role='superAdmin' type={'items'} data={itemsTable} />
      <p>Sales Table</p>
      <Table role='superAdmin' type={'sales'} data={salesTable} />
      <p>Bills Table</p>
      <Table role='superAdmin' type={'bills'} data={billsData} />
      <p>Bill page Table</p>
      <Table role='superAdmin' type={'bills'} data={billsData} />
      <p>History Table</p>
      <Table role='superAdmin' type={'history'} data={historyTableSuperAdmin} />
      <p>Users Table</p>
      <Table role='superAdmin' type={'users'} data={userTableData} Edit={() => console.log('first')} Delete />
      <p>Organization Table</p>
      <Table role='superAdmin' type={'organization'} data={organizationTable} />
      <br />
      <br />
      <h3>Admin tables</h3>
      <p>Items Table</p>
      <Table role='admin' type={'items'} data={itemsTable} />
      <p>Users Table</p>
      <Table role='admin' type={'users'} data={userTableData} Edit Delete />
      <p>Inventory Table</p>
      <Table role='admin' type={'inventory'} data={inventoryTable} Edit Delete />
      <p>Bill page Table</p>
      <Table role='admin' type={'bills'} data={billsData} print />
      <p>History Table</p>
      <Table role='admin' type={'history'} data={historyTableAdmin} />
      <br />
      <br />
      <h3>User tables</h3>
      <p>Inventory Table</p>
      <Table role='user' type={'inventory'} data={inventoryTable} />
      <p>Bill page Table</p>
      <Table role='user' type={'bills'} data={billsData} print />
      <p>History Table</p>
      <Table role='user' type={'history'} data={historyTableAdmin} paginate={(e) => console.log(e)} />

      <br />
      <br />
      <br />
      <p className="">Modals</p>
      <div className="flex gap-2">
        <Button onClick={() => setModal(true)} style='primary' type='button' className='' >Remove Modal</Button>
        <Button onClick={() => setModal2(true)} style='primary' type='button' className='' >Save Modal</Button>
        <Button onClick={() => setModal3(true)} style='primary' type='button' className='' >Success Modal</Button>
        {/* Delete Modal */}
        <Modal show={modal} onClose={modalHandler}>
          <div className="grid gap-6">
            <div className="flex gap-6 items-start -mt-10 max-w-[90%]">
              <div className="flex items-center justify-center relative">
                <div className="bg-[#fcd1d8] w-[3rem] h-[3rem] p-2 rounded-full">
                  <div className="bg-[#faafaf] w-[2rem] h-[2rem] p-1 rounded-full">
                    <Delete className="stroke-danger h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-danger font-semibold font-nunito">Remove</p>
                <p className="text-primary text-base ">Are you sure you want to remove this item? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button style='outline' onClick={modalHandler}>Cancel</Button>
              <Button style='custom' className='bg-[#AF2626] text-white py-2 px-4 ' onClick={() => { console.log('Delete') }}>Delete</Button>
            </div>
          </div>
        </Modal>

        {/* Save Modal */}

        <Modal show={modal2} onClose={modalHandler2}>
          <div className="grid gap-6">
            <div className="flex gap-6 items-start -mt-10 max-w-[90%]">
              <div className="flex items-center justify-center relative">
                <div className="bg-[#FFFAEB] w-[3rem] h-[3rem] p-2 rounded-full">
                  <div className="bg-[#FEF0C7] w-[2rem] h-[2rem] p-1 rounded-full">
                    <SaveIcon className="stroke-[#DC6803] h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-[#DC6803] font-semibold font-nunito">Unsaved Changes</p>
                <p className="text-primary text-base ">Do you want to save or discard changes?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button style='outline' onClick={modalHandler2}>Cancel</Button>
              <Button style='custom' className='bg-[#DC6803] text-white py-2 px-4' onClick={() => { console.log('Delete') }}>Confirm</Button>
            </div>
          </div>
        </Modal>

        {/* Success Modal */}

        <Modal show={modal3} onClose={modalHandler3}>
          <div className="grid gap-6">
            <div className="flex gap-6 items-start -mt-10 max-w-[90%]">
              <div className="flex items-center justify-center relative">
                <div className="bg-[#e8fdf3] w-[3rem] h-[3rem] p-2 rounded-full">
                  <div className="bg-[#c4f0db] w-[2rem] h-[2rem] p-1 rounded-full">
                    <Success className="stroke-[#01B763] h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-black font-semibold font-nunito">Successfully Updated</p>
                <p className="text-primary text-base break-words ">Successfully Updated This blog post has been published.<br /> Team members will be able to edit this post and republish changes.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button style='custom' className='bg-[#01B763] py-2 px-3 rounded-full text-white' onClick={modalHandler3}>Continue</Button>
            </div>
          </div>
        </Modal>
      </div>
      {/* Toaster */}
      <p>Toaster</p>
      <div className="flex gap-3">
        <Button style='secondary' className='bg-[#DC6803] ' onClick={() => { toast.success('Toasted Successfully') }}>Success</Button>
        <Button style='secondary' className='bg-[#DC6803] ' onClick={() => { toast.error('Something went Wrong!!!') }}>Error</Button>
        <Button style='secondary' className='bg-[#DC6803] ' onClick={() => { toast.loading('Loading...', { duration: 2000 }) }}>Loading</Button>
      </div>
      {/* Cards */}
      <p>Cards</p>
      <div className="flex gap-2 flex-wrap">
        <CardWrapper>Card Wrapper</CardWrapper>
        <SingleCard amount={300} title={'Total Store'} icon={<CartBlue />} />
        <SingleCard type='currency' amount={1200} title={'Total Revenue'} icon={<CartBlue />} />
        <MultipleCard title="Sales Overview" reload={() => { console.log("reloaded") }} >
          <SingleCard style='multiple' type='' amount={60} title={'Inventory Restock'} icon={<CartBlue />} />
          <SingleCard style='multiple' type='' amount={5} title={'Stock out items'} icon={<CartBlue />} />
          <SingleCard style='multiple' type='currency' amount={4} title={'Ideal Item'} icon={<CartBlue />} />
          <SingleCard style='multiple' amount={100} title={'Total Items'} icon={<CartBlue />} />
        </MultipleCard>
        <ProductCard data={productCardData} cardHandler={(data) => console.log(data)} />
      </div>
      {/* Accounts Charts */}
      <p className="">Accounts Chart</p>
      <div className="flex gap-3 w-full">
        <div className="w-full">
          <ReactApexChart
            options={{
              chart: {
                id: 'sales overview',
                toolbar: {
                  show: false,
                },
              },
              xaxis: {
                categories: data.year.categories,
              },
              yaxis: {
                show: true,
                axisBorder: true
              },
              stroke: {
                curve: 'straight',
                colors: ['#FFBC2E'],
                dashArray: 3

              },
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'vertical',
                  opacityFrom: 4,
                  opacityTo: 0,
                }
              },
              colors: ['#FFBC2E', '#ededed00'],
              dataLabels: { enabled: false },
            }}
            series={data.year.series}
            type='area'
            width='100%'
            height={428}
          />
        </div>
        <div className="w-full">
          <ReactApexChart
            options={{
              chart: {
                id: 'sales overview',
                toolbar: {
                  show: false,
                },
              },
              xaxis: {
                categories: data.year.categories,
              },
              yaxis: {
                show: true,
                axisBorder: true
              },
              stroke: {
                curve: 'straight',
                colors: ['#DB7D89'],
                dashArray: 3

              },
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'vertical',
                  opacityFrom: 4,
                  opacityTo: 0,
                }
              },
              colors: ['#DB7D89'],
              dataLabels: { enabled: false },
            }}
            series={data.year.series}
            type='area'
            width='100%'
            height={428}
          />
        </div>
      </div>
    </div>
  </>
  )
}

export default Components;
