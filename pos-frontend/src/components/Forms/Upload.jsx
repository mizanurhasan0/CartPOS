import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImgUpload } from '@/assets/SvgComponents';
import { validateImage, MAX_IMAGE_MB } from '@/utils/helpers/CheckImgSize';

/**
 * Image upload with click-to-browse and drag & drop.
 *
 * @param {File|string|null} image   Selected File, or a stored file name coming from the server.
 * @param {function} setImage        Called with the validated File.
 * @param {Object} register          Optional react-hook-form `register('image', ...)` result (kept for backward compatibility).
 * @param {string} [label]           Optional caption above the drop area.
 */
export default function Upload({ image, setImage, register = {}, label }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const isFile = typeof File !== 'undefined' && image instanceof File;

    const preview = useMemo(() => {
        if (isFile) return URL.createObjectURL(image);
        if (image) return `${import.meta.env.VITE_SERVER_URL}/file/${image}`;
        return ImgUpload;
    }, [image, isFile]);
    useEffect(() => () => { if (isFile) URL.revokeObjectURL(preview); }, [preview, isFile]);

    const { ref: registerRef, ...registerRest } = register;
    const setRefs = (el) => {
        inputRef.current = el;
        if (typeof registerRef === 'function') registerRef(el);
    };

    const open = () => inputRef.current?.click();
    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (validateImage(file)) setImage?.(file);
    };
    const remove = (e) => {
        e.stopPropagation();
        if (inputRef.current) inputRef.current.value = '';
        setImage?.(null);
    };

    return (
        <div className="flex flex-col items-center gap-1.5">
            {label ? <span className="text-xs font-semibold text-primary1 self-start">{label}</span> : null}
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload image: click to browse or drop a file here"
                onClick={open}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
                onDrop={onDrop}
                className={`w-full max-w-sm flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-center cursor-pointer transition outline-none focus-visible:ring-2 focus-visible:ring-primary3/40 ${dragging ? 'border-primary3 bg-primary3/10' : 'border-border hover:border-primary3 hover:bg-light/40'}`}
            >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-light flex items-center justify-center shrink-0">
                    <img src={preview} alt="" className={image ? 'w-full h-full object-cover' : 'w-8 h-8 opacity-60'} onError={(e) => { e.target.onerror = null; e.target.src = ImgUpload; }} />
                </div>
                <p className="text-sm text-black2 leading-tight">
                    <span className="font-semibold text-primary3">{image ? 'Change photo' : 'Click to upload'}</span>
                    {dragging ? ' — drop it here' : ' or drag & drop'}
                </p>
                <p className="text-xs text-label">PNG or JPG, up to {MAX_IMAGE_MB}MB</p>
            </div>
            {isFile ? (
                <button type="button" onClick={remove} className="text-xs font-semibold text-danger hover:underline">Remove selected photo</button>
            ) : null}
            <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" id="image" className="hidden" {...registerRest} ref={setRefs} />
        </div>
    );
}
