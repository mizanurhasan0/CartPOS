/**
 * A flexible table component that renders different table structures based on the role and type.
 *
 * @component
 * @param {Object} props - The component's props.
 * @param {string} [props.role='superAdmin'] - The user role, options: 'superAdmin', 'admin', 'user'.
 * @param {string} props.type - The table type, e.g., 'items', 'sales', 'history'.
 * @param {Array<Object>} props.data - An array of data objects to populate the table rows.
 * @param {Function} props.onClick - A callback function triggered when a table row is clicked.
 * @param {Function} props.paginate - A callback function for pagination.
 * @param {Function} props.Delete - A callback function for deleting an item.
 * @param {Function} props.Edit - A callback function for editing an item.
 * @param {boolean} [props.print=false] - Whether to show a print button in the table.
 * @returns {JSX.Element} - The rendered table component.
 */


import React from 'react';
import Pen from '../../../assets/Icons/pen.svg?react';
import Dlt from '../../../assets/Icons/delete.svg?react';
import PrintIcon from '../../../assets/Icons/print.svg?react'
import Arrow from '../../../assets/Icons/arrow-down.svg?react'
import Badge from '../Badge/Badge';
import { useSelector } from 'react-redux';

const SUPER_TABLE_TYPES = {
    items: ['_id', 'ID', 'Product Name', 'Buying Price', "In Stock", 'Selling Price', 'Tax'],
    sales: ['_id', 'ID', 'Date', 'Cashier', 'Customer', 'Payment Method', 'Total Price'],
    history: ['_id', 'ID', 'Product Name', 'Date', 'Quantity', 'Price',],
    bills: ['_id', 'ID', 'Customer Name', 'Cashier Name', 'Product Name', 'Selling Date', 'Items', 'Selling Price', 'Discount', 'Tax', 'Total'],
    users: ['_id', 'ID', 'User Name', 'Store Name', 'Role', 'Email', 'Status', 'Action'],
    organization: ['_id', 'ID', 'Organization Name', 'Owner Name', 'Email', 'Registration', 'Status', 'Action', 'Reset'],
    store: ['_id', 'ID', 'Store Name', 'Admin / Owner', 'Total Users', 'Status', "Action"]
}
const ADMIN_TABLE_TYPES = {
    items: ['_id', 'ID', 'Product Name', 'Buying Price', "In Stock", 'Selling Price', 'Tax'],
    sales: ['_id', 'ID', 'Date', 'Cashier', 'Customer', 'Payment Method', 'Total Price'],
    history: ['_id', 'ID', 'Product Name', 'Date', 'Quantity', 'Price',],
    bills: ['_id', 'ID', 'Customer Name', 'Cashier Name', 'Product Name', 'Date', 'Items', 'Price', 'Discount', 'Tax', 'Total'],
    users: ['_id', 'ID', 'User Name', 'Store Name', 'Role', 'Email', 'Status', 'Action'],
    // organization: ['_id', 'ID', 'Organization Name', 'Owner Name', 'Email', 'Registration', 'Action'],
    inventory: ['_id', 'ID', 'Product Name', 'Stock Date', 'Buying Price', 'Selling Price', 'Tax', 'In Stock', 'Status', 'Action'],
}
const USER_TABLE_TYPES = {
    inventory: ['_id', 'ID', 'Product Name', 'Stock Date', 'Selling Price', 'Tax', 'In Stock', 'Status'],
    bills: ['_id', 'ID', 'Customer Name', 'Cashier Name', 'Product Name', 'Date', 'Items', 'Price', 'Discount', 'Tax', 'Total'],
    history: ['_id', 'ID', 'Product Name', 'Selling Date', 'Quantity', 'Selling Price'],

}
const Table = ({ role = 'superAdmin', type, data, onClick = () => { }, paginate, Delete, Edit, print, reset }) => {
    const currency = useSelector((state) => state.storeStore?.store?.currency  || {symbol: "$"});
    if (role == 'superAdmin') {
        return (
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <table className='rt bg-white table-auto min-w-full'>
                        <thead>
                            <tr className='border-y border-border'>
                                {
                                    SUPER_TABLE_TYPES[type].map((item, index) => <th className='text-xs text-left font-semibold text-primary py-2 px-3 whitespace-nowrap' key={index}>{item}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody >
                            {
                                data?.length < 1 ? <tr><td></td><td colSpan={'100%'} className='text-center p-4'>No Data</td></tr> : data?.map((item, index) => {
                                    return (
                                        <tr className='border-b border-border hover:bg-light cursor-default' key={index}>
                                            {Object.entries(item).map((element, index) =>
                                                <td key={index} data-label={SUPER_TABLE_TYPES[type]?.[index]} onClick={() => { index === 2 ? onClick(item) : null }} className={`text-sm text-left font-normal ${element[0] == 'name' ? 'truncate max-w-xs' : 'test'} ${index == 2 && 'cursor-pointer'} ${element[0].toLowerCase().search('discount') != -1
                                                    ? 'text-danger' :
                                                    (type === 'inventory' && element[0].toLocaleLowerCase().search('buyprice') != -1) ?
                                                        'text-danger' :
                                                        (type === 'inventory' && element[0].toLocaleLowerCase().search('sellprice') != -1) ?
                                                            'text-primary3' :
                                                            'text-primary'
                                                    }  py-2 px-3 whitespace-nowrap`}>
                                                    {element[0].search('tax') != -1 ? currency.symbol + " " : ''}
                                                    {element[0].toLowerCase().search('price') != -1 ? currency.symbol + " " : ''}
                                                    {element[0].toLowerCase().search('id') != -1 ? "#" : ''}
                                                    {(element[1] == 'active' || element[1] == 'deactive') ? <Badge text={element[1]} /> : element[1]}
                                                </td>)}
                                            {(Delete || Edit) && <td className='flex items-center gap-2 h-full text-sm text-left font-normal py-2 px-3 whitespace-nowrap'>
                                                {Edit && <Pen onClick={() => Edit(item)} className='stroke-primary hover:stroke-primary3 cursor-pointer' />}
                                                {Delete && <Dlt onClick={() => Delete(item)} className='stroke-primary cursor-pointer hover:stroke-danger' />}
                                            </td>}
                                            {
                                                type== 'organization' && <td><button onClick={()=> reset(item._id)} className='bg-danger text-white px-3 rounded-full'>Reset</button></td>
                                            }
                                            {print && <td className='flex items-center gap-2 h-full text-sm text-left font-normal py-2 px-3 whitespace-nowrap'>
                                                <PrintIcon onClick={() => print(item)} className='stroke-primary hover:stroke-primary3 cursor-pointer' />
                                            </td>}
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {paginate && <div className="flex justify-between items-center mt-3">
                    <span className="text-primary1 text-sm">
                        Showing {data?.page === 1 ? 1 : (((data?.page - 1) * 10) + 1)} - {data?.page === 1 ? data?.docs?.length : ((data?.page - 1) * 10) + data?.docs?.length} of {data?.totalDocs} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={data?.prevPage === null}
                            onClick={() => paginate(data?.prevPage)}
                        >
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 rotate-90' />
                        </button>
                        <button
                            disabled={data?.prevPage === null}
                            onClick={() => paginate(data?.prevPage)}
                        >
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 -rotate-90' />
                        </button>
                    </div>
                </div>}
            </div>
        );
    } else if (role == 'admin') {
        return (
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <table className='rt bg-white table-auto min-w-full'>
                        <thead>
                            <tr className='border-y border-border'>
                                {
                                    ADMIN_TABLE_TYPES[type].map((item, index) => <th className='text-xs text-left font-semibold text-primary py-2 px-3 whitespace-nowrap' key={index}>{item}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody >
                            {
                                data?.length < 1 ? <tr><td></td><td colSpan={'100%'} className='text-center p-4'>No Data</td></tr> : data?.map((item, index) => {
                                    return (
                                        <tr className='border-b border-border hover:bg-light cursor-default' key={index}>
                                            {Object.entries(item).map((element, index) =>
                                                <td key={index} data-label={ADMIN_TABLE_TYPES[type]?.[index]} onClick={() => { index === 2 ? onClick(item) : null }} className={`text-sm text-left font-normal  ${element[0] == 'name' ? 'truncate max-w-xs' : 'test'} ${index == 2 && 'cursor-pointer truncate max-w-xs'} ${element[0].toLowerCase().search('discount') != -1
                                                    ? 'text-danger' :
                                                    (type === 'inventory' && element[0].toLocaleLowerCase().search('buyprice') != -1) ?
                                                        'text-danger' :
                                                        (type === 'inventory' && element[0].toLocaleLowerCase().search('sellprice') != -1) ?
                                                            'text-primary3' :
                                                            'text-primary'
                                                    }  py-2 px-3 whitespace-nowrap`}>
                                                    {element[0].search('tax') != -1 ? currency.symbol  + " ": ''}
                                                    {element[0].toLowerCase().search('price') != -1 ? currency.symbol  + " ": ''}
                                                    {element[0].toLowerCase().search('id') != -1 ? "#" : ''}
                                                    {(element[1] == 'active' || element[1] == 'deactive' || element[1] == 'available' || element[1] == 'stockout') ? <Badge text={element[1]} /> : element[1]}
                                                </td>)}

                                            {(Delete || Edit) && <td className='flex items-center gap-2 h-full text-sm text-left font-normal py-2 px-3 whitespace-nowrap'>
                                                {Edit && <Pen onClick={() => Edit(item)} className='stroke-primary hover:stroke-primary3 cursor-pointer' />}
                                                {Delete && <Dlt onClick={() => Delete(item)} className='stroke-primary cursor-pointer hover:stroke-danger' />}
                                            </td>}

                                            {print && <td className='flex items-center gap-2 h-full text-sm text-left font-normal py-2 px-3 whitespace-nowrap'>
                                                <PrintIcon onClick={() => print(item)} className='stroke-primary hover:stroke-primary3 cursor-pointer' />
                                            </td>}
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {paginate && <div className="flex justify-between items-center mt-3">
                    <span className="text-primary1 text-sm">
                        Showing {data?.page === 1 ? 1 : (((data?.page - 1) * 10) + 1)} - {data?.page === 1 ? data?.docs?.length : ((data?.page - 1) * 10) + data?.docs?.length} of {data?.totalDocs} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={data?.prevPage === null}
                            onClick={() => paginate(data?.prevPage)}
                        >
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 rotate-90' />
                        </button>
                        <button
                            disabled={data?.prevPage === null}
                            onClick={() => paginate(data?.prevPage)}
                        >
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 -rotate-90' />
                        </button>
                    </div>
                </div>}
            </div>
        );
    } else {
        return (
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <table className='rt bg-white table-auto min-w-full'>
                        <thead>
                            <tr className='border-y border-border'>
                                {
                                    USER_TABLE_TYPES[type].map((item, index) => <th className='text-xs text-left font-semibold text-primary py-2 px-3 whitespace-nowrap' key={index}>{item}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody >
                            {
                                data?.length < 1 ? <tr><td></td><td colSpan={'100%'} className='text-center p-4'>No Data</td></tr> : data?.map((item, index) => {
                                    return (
                                        <tr className='border-b border-border hover:bg-light cursor-default' key={index}>
                                            {Object.entries(item).map((element, index) =>
                                                <td key={index} data-label={USER_TABLE_TYPES[type]?.[index]} onClick={() => { index === 2 ? onClick(item) : null }} className={`text-sm text-left font-normal  ${element[0] == 'name' ? 'truncate max-w-xs' : 'test'} ${index == 2 && 'cursor-pointer'} ${element[0].toLowerCase().search('discount') != -1
                                                    ? 'text-danger' :
                                                    (type === 'inventory' && element[0].toLocaleLowerCase().search('buyprice') != -1) ?
                                                        'text-danger' :
                                                        (type === 'inventory' && element[0].toLocaleLowerCase().search('sellprice') != -1) ?
                                                            'text-primary3' :
                                                            'text-primary'
                                                    }  py-2 px-3 whitespace-nowrap`}>
                                                    {element[0].search('tax') != -1 ? currency.symbol  + " ": ''}
                                                    {element[0].toLowerCase().search('price') != -1 ? currency.symbol  + " " : ''}
                                                    {element[0].toLowerCase().search('id') != -1 ? "#" : ''}
                                                    {(element[1] == 'active' || element[1] == 'deactive' || element[1] == 'available' || element[1] == 'stockout') ? <Badge text={element[1]} /> : element[1]}

                                                </td>)}

                                            {(Delete || Edit) && <td className='flex items-center gap-2 h-full text-sm text-left font-normal py-2 px-3 whitespace-nowrap'>
                                                {Edit && <Pen onClick={Edit} className='stroke-primary hover:stroke-primary3 cursor-pointer' />}
                                                {Delete && <Dlt onClick={Delete} className='stroke-primary cursor-pointer hover:stroke-danger' />}
                                            </td>}

                                            {print && <td className='flex items-center gap-2 h-full text-sm text-left font-normal py-2 px-3 whitespace-nowrap'>
                                                <PrintIcon onClick={() => print(item)} className='stroke-primary hover:stroke-primary3 cursor-pointer' />
                                            </td>}
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {paginate && <div className="flex justify-between items-center mt-3">
                    <span className="text-primary1 text-sm">
                        Showing {data?.page === 1 ? 1 : (((data?.page - 1) * 10) + 1)} - {data?.page === 1 ? data?.docs?.length : ((data?.page - 1) * 10) + data?.docs?.length} of {data?.totalDocs} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={data?.prevPage === null}
                            onClick={() => paginate(data?.prevPage)}
                        >
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 rotate-90' />
                        </button>
                        <button
                            disabled={data?.prevPage === null}
                            onClick={() => paginate(data?.prevPage)}
                        >
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 -rotate-90' />
                        </button>
                    </div>
                </div>}
            </div>
        );
    }
};

export default Table;