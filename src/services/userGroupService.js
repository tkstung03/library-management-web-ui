import { axiosPrivate } from '~/apis/configHttp';

export const createUserGroup = (values) => {
    return axiosPrivate.post('user-groups', values);
};

export const updateUserGroup = (id, values) => {
    return axiosPrivate.put(`user-groups/${id}`, values);
};

export const deleteUserGroup = (id) => {
    return axiosPrivate.delete(`user-groups/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`user-groups/${id}/toggle-active`);
};

export const getUserGroupById = (id) => {
    return axiosPrivate.get(`user-groups/${id}`);
};

export const getUserGroups = (params) => {
    return axiosPrivate.get(`user-groups?${params}`);
};
