import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, Input, message, Space } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { readerLogin } from '~/services/authService';
import useAuth from '~/hooks/useAuth';
import { handleError } from '~/utils/errorHandler';
import { ROLES } from '~/common/roleConstants';

const validationSchema = yup.object({
    cardNumber: yup.string().trim().required('Vui lòng nhập số thẻ'),

    password: yup.string().required('Vui lòng nhập mật khẩu'),
});

const defaultValue = {
    cardNumber: '',
    password: '',
};
function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [messageApi, contextHolder] = message.useMessage();
    const { isAuthenticated, user, login } = useAuth();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const response = await readerLogin(values);
            if (response.status === 200) {
                const { accessToken, refreshToken } = response.data.data;
                login({ accessToken, refreshToken });
                navigate(from, { replace: true });
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
        onSubmit: handleLogin,
    });

    useEffect(() => {
        if (isAuthenticated && user.roleNames.includes(ROLES.Reader)) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, user.roleNames, navigate]);

    return (
        <main className="py-5">
            {contextHolder}

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-6">
                        <h2>Đăng nhập</h2>
                        <p>Xin chào, vui lòng nhập nội dung sau để tiếp tục.</p>

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
                                <label htmlFor="password">Mật khẩu:</label>
                                <Input.Password
                                    size="large"
                                    id="password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    status={formik.touched.password && formik.errors.password ? 'error' : undefined}
                                />
                                <div className="text-danger">{formik.touched.password && formik.errors.password}</div>
                            </div>

                            <Space className="p-1">
                                <Button
                                    style={{ width: '170px' }}
                                    size="large"
                                    type="primary"
                                    htmlType="submit"
                                    loading={formik.isSubmitting}
                                >
                                    Đăng nhập
                                </Button>
                                <Link to="/forgot-password">Quên mật khẩu ?</Link>
                            </Space>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;
