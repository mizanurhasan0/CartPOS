import { toast } from "react-hot-toast";

export const ImageType = ['png', 'jpg', 'jpeg'];
export const MAX_IMAGE_MB = 1;

/** Validates an image File (type + size). Shows a toast and returns false when invalid. */
export const validateImage = (file) => {
    if (!file) return false;
    const type = ImageType.includes(file.type?.split('/')[1] || '');
    if (!type) { toast.error('Only ' + ImageType.join(', ').toUpperCase() + ' images are allowed'); return false; }
    if (file.size / (1024 * 1024) > MAX_IMAGE_MB) { toast.error(`Image size must not exceed ${MAX_IMAGE_MB}MB`); return false; }
    return true;
};

const CheckImgSize = (e, setImage) => {
    const img = e?.target?.files?.[0];
    if (validateImage(img)) setImage(img);
};
export default CheckImgSize;
