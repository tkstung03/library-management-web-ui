import { axiosPrivate } from '~/apis/configHttp';

export const getRoles = () => {
    return axiosPrivate.get('roles');
};
