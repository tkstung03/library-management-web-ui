import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Checkbox, Input, message } from 'antd';

import { FaUser, FaKey } from 'react-icons/fa';

import { useFormik } from 'formik';
import * as yup from 'yup';

import classNames from 'classnames/bind';
import styles from '~/styles/AdminLogin.module.scss';
import useAuth from '~/hooks/useAuth';
import { adminLogin } from '~/services/authService';
import { handleError } from '~/utils/errorHandler';
import images from '~/assets';

const cx = classNames.bind(styles);

const validationSchema = yup.object({
    username: yup.string().trim().required('Vui lòng nhập tên tài khoản'),

    password: yup.string().required('Vui lòng nhập mật khẩu'),
});

const defaultValue = {
    username: '',
    password: '',
};

function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [rememberMe, setRememberMe] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const { isAuthenticated, login } = useAuth();

    const from = location.state?.from?.pathname || '/admin';

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const response = await adminLogin(values);
            if (response.status === 200) {
                const { accessToken, refreshToken } = response.data.data;
                if (rememberMe) {
                    login({ accessToken, refreshToken });
                } else {
                    login({ accessToken });
                }
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
        if (isAuthenticated) {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="container">
            {contextHolder}

            <div className="row justify-content-center">
                <div className="col-4">
                    <div className={cx('login-panel')}>
                        <div className={cx('panel-heading')}>
                            <h3 className="panel-title text-center mb-0">
                                <Link to="/" className="d-block">
                                    <img src={images.logo} alt="logo" style={{ height: 40 }} />
                                </Link>
                            </h3>
                        </div>

                        <div className={cx('panel-body')}>
                            <form className="mb-2" onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username">Tên đăng nhập:</label>
                                    <Input
                                        addonBefore={<FaUser />}
                                        size="large"
                                        id="username"
                                        name="username"
                                        autoComplete="on"
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        status={formik.touched.username && formik.errors.username ? 'error' : undefined}
                                    />
                                    <div className="text-danger">
                                        {formik.touched.username && formik.errors.username}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password">Mật khẩu:</label>
                                    <Input.Password
                                        addonBefore={<FaKey />}
                                        size="large"
                                        id="password"
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        status={formik.touched.password && formik.errors.password ? 'error' : undefined}
                                    />
                                    <div className="text-danger">
                                        {formik.touched.password && formik.errors.password}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                                        Nhớ mật khẩu
                                    </Checkbox>
                                </div>

                                <Button
                                    size="large"
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={formik.isSubmitting}
                                >
                                    Đăng nhập
                                </Button>
                            </form>
                            <Link to="/admin/forgot-password">Quên mật khẩu?</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
