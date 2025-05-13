import { axiosPrivate } from '~/apis/configHttp';

export const getBookBorrows = (params) => {
    return axiosPrivate.get(`admin/book-borrows?${params}`);
};

export const returnBooks = async (bookIds) => {
    return axiosPrivate.put('admin/book-borrows/return-books', bookIds);
};

export const reportLostBooks = async (bookIds) => {
    return axiosPrivate.put('admin/book-borrows/report-lost', bookIds);
};
