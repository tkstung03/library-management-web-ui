import { axiosPrivate } from '~/apis/configHttp';

export const createReader = (values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.post('readers', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateReader = (id, values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.put(`readers/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteReader = (id) => {
    return axiosPrivate.delete(`readers/${id}`);
};

export const getReaderById = (id) => {
    return axiosPrivate.get(`readers/${id}`);
};

export const getReaderByCardNumber = (cardNumber) => {
    return axiosPrivate.get(`readers/card-number/${cardNumber}`);
};

export const getReaders = (params) => {
    return axiosPrivate.get(`readers?${params}`);
};

export const printCards = (values) => {
    return axiosPrivate.post('readers/print-cards', values, {
        responseType: 'arraybuffer',
    });
};

export const getReaderDetails = (params) => {
    return axiosPrivate.get('readers/details');
};
