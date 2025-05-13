/**
 * Handles error responses and sets appropriate messages.
 * @param {Object} error - The error object returned from an API call.
 * @param {Object} formik - The formik instance for setting field errors.
 * @param {Object} messageApi - The API used for displaying error messages.
 * @param {Object} [options] - Optional configurations for error handling.
 */
export function handleError(error, formik, messageApi, options = {}) {
    let message = options.defaultMessage || 'Có lỗi xảy ra';

    if (!error?.response) {
        message = options.noResponseMessage || 'Máy chủ không phản hồi';
    } else {
        const data = error.response?.data?.message;
        if (typeof data === 'object') {
            message = options.objectErrorMessage || 'Có lỗi xảy ra, vui lòng thử lại';

            const errorMessages = error.response.data.message;

            Object.keys(errorMessages).forEach((field) => {
                formik.setFieldError(field, errorMessages[field]);
            });
        } else {
            message = data;
        }
    }

    if (options.logErrors) {
        console.error('Error:', error);
    }

    messageApi.error(message);
}
