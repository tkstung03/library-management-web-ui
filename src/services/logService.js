import { axiosPrivate } from '~/apis/configHttp';

export const getLogs = (params) => {
    return axiosPrivate.get(`logs?${params}`);
};
