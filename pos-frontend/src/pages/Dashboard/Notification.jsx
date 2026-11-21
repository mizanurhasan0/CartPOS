import { CardDeliveryBox } from '@/assets/SvgComponents';
import duration from '@/utils/helpers/duration';
import React from 'react';

export default function Notification({ notStocks = [] }) {
    return (
        <>
            <h1 className='py-5 text-sm text-primary2 font-semibold px-3'>Notfication</h1>
            <div className="h-64 overflow-y-auto pl-3 scroll-smooth">
                {notStocks.length === 0 ? <p className="text-primary3 text-xs text-center flex justify-center items-center h-full">Empty....</p> : ''}
                {notStocks.map((d, i) => (
                    <div key={i} className="min-h-[2.75rem] flex space-x-3 border-t border-light py-2 pr-3">
                        <div className="w-6 h-6 bg-primary4 bg-opacity-40 rounded-lg flex items-center justify-center">
                            <CardDeliveryBox />
                        </div>
                        {/* max-h-[2.75rem] */}
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-primary1 w-64">Product name #{d.item.name + ` (${d?.item?.id})` || ''}  has been {d.msg || ''}</p>
                            <p className="text-xs  font-normal text-label leading-5">{duration(d?.date)} ago</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
