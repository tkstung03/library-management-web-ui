import { axiosPrivate } from '~/apis/configHttp';

export const createClassificationSymbol = (values) => {
    return axiosPrivate.post('classification-symbols', values);
};

export const updateClassificationSymbol = (id, values) => {
    return axiosPrivate.put(`classification-symbols/${id}`, values);
};

export const deleteClassificationSymbol = (id) => {
    return axiosPrivate.delete(`classification-symbols/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`classification-symbols/${id}/toggle-active`);
};

export const getClassificationSymbolById = (id) => {
    return axiosPrivate.get(`classification-symbols/${id}`);
};

export const getClassificationSymbols = (params) => {
    return axiosPrivate.get(`classification-symbols?${params}`);
};
