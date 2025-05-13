import { axiosPrivate } from '~/apis/configHttp';

export const getCurrentUserLogin = () => {
    return axiosPrivate.get('users/current');
};

export const createUser = (values) => {
    return axiosPrivate.post('users', values);
};

export const updateUser = (id, values) => {
    return axiosPrivate.put(`users/${id}`, values);
};

export const deleteUser = (id) => {
    return axiosPrivate.delete(`users/${id}`);
};

export const getUserById = (id) => {
    return axiosPrivate.get(`users/${id}`);
};

export const getUsers = (params) => {
    return axiosPrivate.get(`users?${params}`);
};

export const uploadImages = (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    return axiosPrivate.post('users/upload-images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
