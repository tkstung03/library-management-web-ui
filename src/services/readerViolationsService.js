import { axiosPrivate } from '~/apis/configHttp';

export const createReaderViolation = (values) => {
    return axiosPrivate.post('reader-violations', values);
};

export const updateReaderViolation = (id, values) => {
    return axiosPrivate.put(`reader-violations/${id}`, values);
};

export const deleteReaderViolation = (id) => {
    return axiosPrivate.delete(`reader-violations/${id}`);
};

export const getReaderViolationById = (id) => {
    return axiosPrivate.get(`reader-violations/${id}`);
};

export const getReaderViolations = (params) => {
    return axiosPrivate.get(`reader-violations?${params}`);
};
