import httpRequest, { axiosPrivate } from '~/apis/configHttp';

export const getBookDefinitionById = (id) => {
    return axiosPrivate.get(`admin/book-definitions/${id}`);
};

export const getBookDefinitions = (params) => {
    return axiosPrivate.get(`admin/book-definitions?${params}`);
};

export const getBookDefinitionsByIds = (values) => {
    return axiosPrivate.post('admin/book-definitions/by-ids', values);
};

export const getBookByBookDefinitions = (params) => {
    return axiosPrivate.get(`admin/book-definitions/books?${params}`);
};

export const getBookByBookDefinitionsForUser = (params) => {
    return httpRequest.get(`book-definitions/books?${params}`);
};

export const getBookDetailForUser = (id) => {
    return httpRequest.get(`book-definitions/books/${id}`);
};

export const updateBookDefinition = (id, values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.put(`admin/book-definitions/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createBookDefinition = (values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.post('admin/book-definitions', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteBookDefinition = (id) => {
    return axiosPrivate.delete(`admin/book-definitions/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`admin/book-definitions/${id}/toggle-active`);
};

export const searchBooks = (params, values) => {
    return axiosPrivate.post(`book-definitions/search?${params}`, values);
};

export const advancedSearchBooks = (params, values) => {
    return axiosPrivate.post(`book-definitions/advanced-search?${params}`, values);
};

export const getBookPdf = (values) => {
    return axiosPrivate.post('book-definitions/pdf', values, {
        responseType: 'arraybuffer',
    });
};

export const getBookLabelType1Pdf = (values) => {
    return axiosPrivate.post('book-definitions/pdf/label-type-1', values, {
        responseType: 'arraybuffer',
    });
};

export const getBookLabelType2Pdf = (values) => {
    return axiosPrivate.post('book-definitions/pdf/label-type-2', values, {
        responseType: 'arraybuffer',
    });
};

export const getBookListPdf = () => {
    return axiosPrivate.get('book-definitions/pdf/book-list', {
        responseType: 'arraybuffer',
    });
};
