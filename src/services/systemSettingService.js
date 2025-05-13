import { axiosPrivate } from '~/apis/configHttp';

export const updateLibraryRules = (values) => {
    return axiosPrivate.put('system-settings/library-rules', values);
};

export const getLibraryRules = () => {
    return axiosPrivate.get('system-settings/library-rules');
};

export const getAllHolidays = (params) => {
    return axiosPrivate.get(`system-settings/holidays?${params}`);
};

export const getHolidayById = (id) => {
    return axiosPrivate.get(`system-settings/holidays/${id}`);
};

export const addHoliday = (values) => {
    return axiosPrivate.post('system-settings/holidays', values);
};

export const updateHoliday = (id, values) => {
    return axiosPrivate.put(`system-settings/holidays/${id}`, values);
};

export const deleteHoliday = (id) => {
    return axiosPrivate.delete(`system-settings/holidays/${id}`);
};

export const getLibraryConfig = () => {
    return axiosPrivate.get('system-settings/library-config');
};

export const updateLibraryConfig = (values) => {
    return axiosPrivate.put('system-settings/library-config', values);
};

export const getLibraryInfo = () => {
    return axiosPrivate.get('system-settings/library-info');
};

export const updateLibraryInfo = (values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.put('system-settings/library-info', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const addSlide = (values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.post('system-settings/slides', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateSlide = (id, values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.put(`system-settings/slides/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const toggleActiveFlagSlide = (id) => {
    return axiosPrivate.patch(`system-settings/slides/${id}/toggle-active`);
};

export const deleteSlide = (id) => {
    return axiosPrivate.delete(`system-settings/slides/${id}`);
};

export const getSlides = (params) => {
    return axiosPrivate.get(`system-settings/slides?${params}`);
};

export const getSlidesById = (values) => {
    return axiosPrivate.get('system-settings/slides', values);
};
