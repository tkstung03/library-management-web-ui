import httpRequest, { axiosPrivate } from '~/apis/configHttp';

export const getLibraryInfoStats = () => {
    return httpRequest.get('stats/library');
};

export const getBorrowStats = () => {
    return axiosPrivate.get('stats/borrow');
};

export const getLoanStatus = async () => {
    return axiosPrivate.get('stats/loan-status');
};

export const getMostBorrowedPublications = async () => {
    return axiosPrivate.get('stats/most-borrowed');
};

export const getPublicationStatisticsByCategory = async () => {
    return axiosPrivate.get('stats/publication-by-category');
};
