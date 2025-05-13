import { axiosPrivate } from '~/apis/configHttp';

export const createPublisher = (values) => {
    return axiosPrivate.post('publishers', values);
};

export const updatePublisher = (id, values) => {
    return axiosPrivate.put(`publishers/${id}`, values);
};

export const deletePublisher = (id) => {
    return axiosPrivate.delete(`publishers/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`publishers/${id}/toggle-active`);
};

export const getPublisherById = (id) => {
    return axiosPrivate.get(`publishers/${id}`);
};

export const getPublishers = (params) => {
    return axiosPrivate.get(`publishers?${params}`);
};
