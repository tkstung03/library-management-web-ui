import { axiosPrivate } from '~/apis/configHttp';

export const generateReceiptNumber = async () => {
    return axiosPrivate.get('import-receipts/generate-receipt-number');
};

export const createImportReceipt = (values) => {
    return axiosPrivate.post('import-receipts', values);
};

export const updateImportReceipt = (id, values) => {
    return axiosPrivate.put(`import-receipts/${id}`, values);
};

export const deleteImportReceipt = (id) => {
    return axiosPrivate.delete(`import-receipts/${id}`);
};

export const getImportReceiptById = (id) => {
    return axiosPrivate.get(`import-receipts/${id}`);
};

export const getImportReceipts = (params) => {
    return axiosPrivate.get(`import-receipts?${params}`);
};
