import { axiosPrivate } from '~/apis/configHttp';

export const createCategory = (values) => {
    return axiosPrivate.post('categories', values);
};

export const updateCategory = (id, values) => {
    return axiosPrivate.put(`categories/${id}`, values);
};

export const deleteCategory = (id) => {
    return axiosPrivate.delete(`categories/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`categories/${id}/toggle-active`);
};

export const getCategoryById = (id) => {
    return axiosPrivate.get(`categories/${id}`);
};

export const getCategories = (params) => {
    return axiosPrivate.get(`categories?${params}`);
};
