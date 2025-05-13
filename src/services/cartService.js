import { axiosPrivate } from '~/apis/configHttp';

export const addToCart = (bookId) => {
    return axiosPrivate.post(`carts/add?bookId=${bookId}`);
};

export const getCartDetails = (params) => {
    return axiosPrivate.get(`carts/details?${params}`);
};

export const removeFromCart = (id) => {
    return axiosPrivate.delete(`carts/remove?cartDetailId=${id}`);
};

export const clearCart = () => {
    return axiosPrivate.delete('carts/clear');
};

export const getPendingBorrowRequests = (params) => {
    return axiosPrivate.get(`carts/pending-borrow-requests?${params}`);
};
