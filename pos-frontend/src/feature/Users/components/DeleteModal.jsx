import { Delete } from '@/assets/SvgComponents'
import { Button, Modal } from '@/components'
import React from 'react'

export default function DeleteModal({ modal, setModal, onDelete = () => { } }) {
    return (
        <Modal show={modal} onClose={() => setModal({ modal: false, id: null })}>
            <div className="grid gap-4">
                <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center relative">
                        <div className="bg-[#fcd1d8] w-10 h-10 p-1.5 shrink-0 rounded-full">
                            <div className="bg-[#faafaf] w-7 h-7 p-0.5 rounded-full">
                                <Delete className="stroke-danger h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-1">
                        <p className="text-danger font-semibold font-nunito">Remove</p>
                        <p className="text-primary text-sm">Are you sure you want to remove this item? This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <Button style='outline' className='!py-1.5 !px-4 !text-sm' onClick={() => setModal({ modal: false, id: null })}>Cancel</Button>
                    <Button style='custom' className='bg-[#AF2626] text-white py-1.5 px-4 text-sm font-semibold' onClick={onDelete}>Delete</Button>
                </div>
            </div>
        </Modal>
    )
}
