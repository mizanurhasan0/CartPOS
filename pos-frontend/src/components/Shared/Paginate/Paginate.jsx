import React from 'react';
import Arrow from '../../../assets/Icons/arrow-down.svg?react'


const Paginate = ({data, callback=()=>{}}) => {
    const btn = 'rounded-full p-0 outline-none transition active:scale-90 focus-visible:ring-2 focus-visible:ring-primary3/50 disabled:opacity-40 disabled:cursor-not-allowed';
    return (
        <div>
            <div className="flex justify-between items-center gap-2 mt-2">
                    <span className="text-primary1 text-xs">
                        Showing {data?.docs?.length===0? '0' : data?.page===1? '1':((data?.page-1) *10)+1 } - {data?.page===1? data?.docs?.length :((data?.page-1) *10)+data?.docs?.length } of {data?.totalDocs} results
                    </span>
                    <div className="flex gap-2 shrink-0">
                        <button type="button" aria-label="Previous page" disabled={!data?.prevPage} className={btn} onClick={()=> { data?.prevPage? callback(data?.prevPage):''}}
                        >
                            <Arrow className='stroke-white bg-primary1 hover:bg-primary3 rounded-full h-6 w-6 rotate-90' />
                        </button>
                        <button type="button" aria-label="Next page" disabled={!data?.nextPage} className={btn} onClick={()=> { data?.nextPage? callback(data?.nextPage):''}}
                        >
                            <Arrow className='stroke-white bg-primary1 hover:bg-primary3 rounded-full h-6 w-6 -rotate-90' />
                        </button>
                    </div>
                </div>
            
        </div>
    );
};

export default Paginate;
