import { axiosPrivate } from '~/apis/configHttp';

export const createLibraryVisit = (values) => {
    return axiosPrivate.post('library-visits', values);
};

export const updateLibraryVisit = (id, values) => {
    return axiosPrivate.put(`library-visits/${id}`, values);
};

export const closeLibrary = () => {
    return axiosPrivate.post('library-visits/close');
};

export const getLibraryVisitById = (id) => {
    return axiosPrivate.get(`library-visits/${id}`);
};

export const getLibraryVisits = (params) => {
    return axiosPrivate.get(`library-visits?${params}`);
};
