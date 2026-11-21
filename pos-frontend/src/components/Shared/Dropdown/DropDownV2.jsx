import React, { useEffect, useState } from 'react';

const DropDownV2 = ({
    label,
    placeholder='Search your product',
    onChange= ()=>{},
    data=[],
    getValue= () =>{},
    error=null,
    searchText=false,


    


}) => {
    const [open,setOpen]=useState(false);
    const [searchVal,setSearchval]=useState('');
    const [selected,setSelected]=useState(null);

    const handleSelect = (item)=>{
        setOpen(false);
        setSearchval(item?.name);
        setSelected(item);
    }

    const handleChange = (e)=>{
        onChange(e.target.value);
        setSearchval(e.target.value);
        setSelected(null)
    }

    useEffect(()=>{
        getValue(selected?.id ||  null);     


    },[selected]);
    
    useEffect(()=>{
        setSearchval('');

    },[searchText]);


    return (
        <div>
            {
                label? <p className='pb-1 text-xs font-semibold text-primary1'>{label}</p>:''
            }

            <div className={`border h-9 flex items-center rounded-full w-full px-4 transition focus-within:ring-2 focus-within:ring-primary3/40 focus-within:border-primary3 ${error?'border-danger':'border-border'}`}>
               <input value={searchVal} type="text" placeholder={placeholder} className='outline-none w-full text-sm bg-transparent' onChange={(e)=>handleChange(e)} onFocus={()=>setOpen(true)}/>
            </div>
           <div className="relative">
           {
                open===true? <div className="absolute top-1 left-0 w-full z-50 max-h-56 overflow-y-auto border border-border bg-white shadow-md py-1 rounded-lg divide-y divide-border text-sm">
                    {
                        data?.map((item, index)=><div key={index} className='px-3 py-1.5 cursor-pointer hover:bg-primary5/20' onClick={()=>handleSelect(item)} >{item?.name}</div>)
                    }
                </div>:''
            }
           </div>

            
        </div>
    );
};

export default DropDownV2;