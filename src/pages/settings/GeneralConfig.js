import { Button, InputNumber, message } from 'antd';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';
import { getLibraryConfig, updateLibraryConfig } from '~/services/systemSettingService';
import { handleError } from '~/utils/errorHandler';

const defaultValue = {
    rowsPerPage: null,
    reservationTime: null,
    maxBorrowLimit: null,
    maxRenewalTimes: null,
    maxRenewalDays: null,
};

const validationSchema = yup.object({
    rowsPerPage: yup
        .number()
        .min(1, 'Số dòng hiển thị phải lớn hơn 0.')
        .required('Số dòng hiển thị trên trang là bắt buộc.'),
    reservationTime: yup
        .number()
        .min(1, 'Thời gian giữ chỗ phải lớn hơn 0.')
        .required('Thời gian giữ chỗ là bắt buộc.'),
    maxBorrowLimit: yup
        .number()
        .min(1, 'Số lượng mượn tối đa phải lớn hơn 0.')
        .required('Số lượng mượn tối đa là bắt buộc.'),
    maxRenewalTimes: yup
        .number()
        .min(0, 'Số lần gia hạn tối đa không được âm.')
        .required('Số lần gia hạn tối đa là bắt buộc.'),
    maxRenewalDays: yup
        .number()
        .min(0, 'Số ngày gia hạn tối đa không được âm.')
        .required('Số ngày gia hạn tối đa là bắt buộc.'),
});

function GeneralConfig() {
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await updateLibraryConfig(values);
            if (response.status === 200) {
                const { message } = response.data.data;
                messageApi.success(message);
            }
        } catch (error) {
            handleError(error, formik, messageApi);
        } finally {
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues: defaultValue,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await getLibraryConfig();
                formik.setValues(response.data.data);
            } catch (error) {}
        };

        fetchEntities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {contextHolder}

            <h2>Cấu hình chung</h2>

            <form onSubmit={formik.handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="rowsPerPage">
                            <span className="text-danger">*</span> Số dòng hiển thị trên trang:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <InputNumber
                            id="rowsPerPage"
                            name="rowsPerPage"
                            min={1}
                            value={formik.values.rowsPerPage}
                            onChange={(value) => formik.setFieldValue('rowsPerPage', value)}
                            onBlur={formik.handleBlur}
                            status={formik.touched.rowsPerPage && formik.errors.rowsPerPage ? 'error' : undefined}
                            style={{ width: '100%' }}
                        />
                        <div className="text-danger">{formik.touched.rowsPerPage && formik.errors.rowsPerPage}</div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="reservationTime">
                            <span className="text-danger">*</span> Thời gian giữ chỗ mượn ấn phẩm:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <InputNumber
                            id="reservationTime"
                            name="reservationTime"
                            min={1}
                            value={formik.values.reservationTime}
                            onChange={(value) => formik.setFieldValue('reservationTime', value)}
                            onBlur={formik.handleBlur}
                            status={
                                formik.touched.reservationTime && formik.errors.reservationTime ? 'error' : undefined
                            }
                            style={{ width: '100%' }}
                        />
                        <div className="text-danger">
                            {formik.touched.reservationTime && formik.errors.reservationTime}
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="maxBorrowLimit">
                            <span className="text-danger">*</span> Số lượng mượn tối đa:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <InputNumber
                            id="maxBorrowLimit"
                            name="maxBorrowLimit"
                            min={1}
                            value={formik.values.maxBorrowLimit}
                            onChange={(value) => formik.setFieldValue('maxBorrowLimit', value)}
                            onBlur={formik.handleBlur}
                            status={formik.touched.maxBorrowLimit && formik.errors.maxBorrowLimit ? 'error' : undefined}
                            style={{ width: '100%' }}
                        />
                        <div className="text-danger">
                            {formik.touched.maxBorrowLimit && formik.errors.maxBorrowLimit}
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="maxRenewalTimes">
                            <span className="text-danger">*</span> Số lần gia hạn tối đa:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <InputNumber
                            id="maxRenewalTimes"
                            name="maxRenewalTimes"
                            min={0}
                            value={formik.values.maxRenewalTimes}
                            onChange={(value) => formik.setFieldValue('maxRenewalTimes', value)}
                            onBlur={formik.handleBlur}
                            status={
                                formik.touched.maxRenewalTimes && formik.errors.maxRenewalTimes ? 'error' : undefined
                            }
                            style={{ width: '100%' }}
                        />
                        <div className="text-danger">
                            {formik.touched.maxRenewalTimes && formik.errors.maxRenewalTimes}
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="maxRenewalDays">
                            <span className="text-danger">*</span> Số ngày gia hạn tối đa:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <InputNumber
                            id="maxRenewalDays"
                            name="maxRenewalDays"
                            min={0}
                            value={formik.values.maxRenewalDays}
                            onChange={(value) => formik.setFieldValue('maxRenewalDays', value)}
                            onBlur={formik.handleBlur}
                            status={formik.touched.maxRenewalDays && formik.errors.maxRenewalDays ? 'error' : undefined}
                            style={{ width: '100%' }}
                        />
                        <div className="text-danger">
                            {formik.touched.maxRenewalDays && formik.errors.maxRenewalDays}
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <span className="text-warning">(*):Không được phép để trống!</span>
                    </div>
                    <div className="col-md-6">
                        <Button type="primary" htmlType="submit">
                            Lưu
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default GeneralConfig;
