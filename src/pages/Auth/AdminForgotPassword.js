import { Link } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import { FaUser } from 'react-icons/fa';

import { IoIosMail } from 'react-icons/io';

import { useFormik } from 'formik';
import * as yup from 'yup';

import classNames from 'classnames/bind';
import styles from '~/styles/AdminLogin.module.scss';
import { handleError } from '~/utils/errorHandler';
import { adminForgotPassword } from '~/services/authService';
import images from '~/assets';

const cx = classNames.bind(styles);

const validationSchema = yup.object({
    username: yup.string().trim().required('Vui lòng nhập tên đăng nhập'),
    email: yup.string().trim().email('Email không hợp lệ').required('Vui lòng nhập email'),
});

const defaultValue = {
    username: '',
    email: '',
};

function AdminForgotPassword() {
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await adminForgotPassword(values);
            if (response.status === 200) {
                if (response.status === 200 && response?.data?.data?.message) {
                    messageApi.success(response.data.data.message);
                }
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
                            <h4>Quên mật khẩu</h4>
                            <p>
                                Bạn quên mật khẩu đăng nhập? Xin hãy nhập địa chỉ email đăng ký thành viên ở đây. Chúng
                                tôi sẽ gứi lại mật khẩu mới cho bạn qua Email.
                            </p>

                            <form className="mb-2" onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email">Tên đăng nhập:</label>
                                    <Input
                                        addonBefore={<FaUser />}
                                        size="large"
                                        id="username"
                                        name="username"
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
                                    <label htmlFor="email">Địa chỉ Email:</label>
                                    <Input
                                        addonBefore={<IoIosMail />}
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

                                <Button
                                    size="large"
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={formik.isSubmitting}
                                >
                                    Gửi yêu cầu
                                </Button>
                            </form>
                            <Link to="/admin/login">Quay lại</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminForgotPassword;
