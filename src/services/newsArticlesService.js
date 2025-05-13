import httpRequest, { axiosPrivate } from '~/apis/configHttp';

export const getNewsArticleById = (id) => {
    return axiosPrivate.get(`admin/news-articles/${id}`);
};

export const getNewsArticles = (params) => {
    return axiosPrivate.get(`admin/news-articles?${params}`);
};

export const updateNewsArticle = (id, values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.put(`admin/news-articles/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createNewsArticle = (values) => {
    const formData = new FormData();

    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            if (value !== null) {
                formData.append(key, value);
            }
        }
    }

    return axiosPrivate.post('admin/news-articles', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteNewsArticle = (id) => {
    return axiosPrivate.delete(`admin/news-articles/${id}`);
};

export const toggleActiveFlag = (id) => {
    return axiosPrivate.patch(`admin/news-articles/${id}/toggle-active`);
};

export const getNewsArticlesForUser = (params) => {
    return httpRequest.get(`news-articles?${params}`);
};

export const getNewsArticleByTitleSlugForUser = (titleSlug) => {
    return axiosPrivate.get(`news-articles/${titleSlug}`);
};
