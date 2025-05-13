import { Link } from 'react-router-dom';

import { Button, Input, message, Space } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { handleError } from '~/utils/errorHandler';
import { readerForgotPassword } from '~/services/authService';

const validationSchema = yup.object({
    cardNumber: yup.string().trim().required('Vui lòng nhập số thẻ'),
    email: yup.string().trim().email('Email không hợp lệ').required('Vui lòng nhập email'),
});

const defaultValue = {
    cardNumber: '',
    email: '',
};

function ForgotPassword() {
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await readerForgotPassword(values);
            if (response.status === 200 && response?.data?.data?.message) {
                messageApi.success(response.data.data.message);
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
    });

    return (
        <main className="py-5">
            {contextHolder}

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-6">
                        <h2>Quên mật khẩu</h2>
                        <p>
                            Bạn quên mật khẩu đăng nhập? Xin hãy nhập địa chỉ email đăng ký thành viên ở đây. Chúng tôi
                            sẽ gứi lại mật khẩu mới cho bạn qua Email.
                        </p>

                        <form onSubmit={formik.handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="cardNumber">Số thẻ:</label>
                                <Input
                                    size="large"
                                    id="cardNumber"
                                    name="cardNumber"
                                    value={formik.values.cardNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    status={formik.touched.cardNumber && formik.errors.cardNumber ? 'error' : undefined}
                                />
                                <div className="text-danger">
                                    {formik.touched.cardNumber && formik.errors.cardNumber}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email">Địa chỉ Email:</label>
                                <Input
                                    size="large"
                                    id="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    status={formik.touched.email && formik.errors.email ? 'error' : undefined}
                                />
                                <div className="text-danger">{formik.touched.email && formik.errors.email}</div>
                            </div>

                            <Space className="p-1">
                                <Button
                                    style={{ width: '170px' }}
                                    size="large"
                                    type="primary"
                                    htmlType="submit"
                                    loading={formik.isSubmitting}
                                >
                                    Gửi yêu cầu
                                </Button>
                                <Link to="/login">Quay lại</Link>
                            </Space>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ForgotPassword;
