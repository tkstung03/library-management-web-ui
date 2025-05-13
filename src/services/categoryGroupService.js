import { axiosPrivate } from '~/apis/configHttp';

export const createCategoryGroup = (values) => {
    return axiosPrivate.post('category-groups', values);
};

export const updateCategoryGroup = (id, values) => {
    return axiosPrivate.put(`category-groups/${id}`, values);
};

export const deleteCategoryGroup = (id) => {
    return axiosPrivate.delete(`category-groups/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`category-groups/${id}/toggle-active`);
};

export const getCategoryGroupById = (id) => {
    return axiosPrivate.get(`category-groups/${id}`);
};

export const getCategoryGroups = (params) => {
    return axiosPrivate.get(`category-groups?${params}`);
};

export const getCategoryGroupsTree = () => {
    return axiosPrivate.get('category-groups/tree');
};
