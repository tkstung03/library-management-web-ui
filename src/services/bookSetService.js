import { axiosPrivate } from '~/apis/configHttp';

export const createBookSet = (values) => {
    return axiosPrivate.post('book-sets', values);
};

export const updateBookSet = (id, values) => {
    return axiosPrivate.put(`book-sets/${id}`, values);
};

export const deleteBookSet = (id) => {
    return axiosPrivate.delete(`book-sets/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`book-sets/${id}/toggle-active`);
};

export const getBookSetById = (id) => {
    return axiosPrivate.get(`book-sets/${id}`);
};

export const getBookSets = (params) => {
    return axiosPrivate.get(`book-sets?${params}`);
};
