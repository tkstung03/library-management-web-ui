import { axiosPrivate } from '~/apis/configHttp';

export const updateBook = (id, values) => {
    return axiosPrivate.put(`books/${id}`, values);
};

export const getBookById = (id) => {
    return axiosPrivate.get(`books/${id}`);
};

export const getBooks = (params) => {
    return axiosPrivate.get(`books?${params}`);
};

export const getBooksByIds = (values) => {
    return axiosPrivate.post('books/by-ids', values);
};

export const getBooksByCodes = (values) => {
    return axiosPrivate.post('books/by-codes', values);
};

export const getBookPdf = (values) => {
    return axiosPrivate.post('books/pdf', values, {
        responseType: 'arraybuffer',
    });
};

export const getBookLabelType1Pdf = (values) => {
    return axiosPrivate.post('books/pdf/label-type-1', values, {
        responseType: 'arraybuffer',
    });
};

export const getBookLabelType2Pdf = (values) => {
    return axiosPrivate.post('books/pdf/label-type-2', values, {
        responseType: 'arraybuffer',
    });
};

export const getBookListPdf = () => {
    return axiosPrivate.get('books/pdf/book-list', {
        responseType: 'arraybuffer',
    });
};
