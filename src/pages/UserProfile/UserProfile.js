import { Button, Input, message } from 'antd';
import { Parallax } from 'react-parallax';

import * as yup from 'yup';
import { useFormik } from 'formik';

import { backgrounds } from '~/assets';
import { handleError } from '~/utils/errorHandler';
import { readerChangePassword } from '~/services/authService';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';
import { useEffect, useState } from 'react';
import { getReaderDetails } from '~/services/readerService';

const { TextArea } = Input;

const defaultValue = {
    oldPassword: '',
    password: '',
    repeatPassword: '',
};

const validationSchema = yup.object({
    oldPassword: yup.string().required('Vui lòng nhập mật khẩu cũ'),
    password: yup
        .string()
        .min(6, 'Mật khẩu tối thiểu 6 kí tự')
        .max(16, 'Mật khẩu tối đa 16 kí tự')
        .matches(/(?=.*[a-zA-Z])/, 'Mật khẩu phải chứa ít nhất một chữ cái')
        .matches(/(?=.*\d)/, 'Mật khẩu phải chứa ít nhất một số')
        .notOneOf([yup.ref('oldPassword'), null], 'Mật khẩu mới không được trùng với mật khẩu cũ')
        .required('Vui lòng nhập mật khẩu'),
    repeatPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Mật khẩu và Mật khẩu xác nhận không giống nhau')
        .required('Vui lòng xác nhận lại mật khẩu'),
});

function UserProfile() {
    const [readerDetails, setReaderDetails] = useState({
        cardNumber: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        status: '',
        createdDate: '',
        expiryDate: '',
    });
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            let response = await readerChangePassword(values);
            messageApi.success(response.data.data.message);
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

    useEffect(() => {
        const fetchReaderDetails = async () => {
            try {
                const response = await getReaderDetails();
                setReaderDetails(response.data.data);
            } catch (error) {
                messageApi.error('Không thể tải thông tin bạn đọc!');
            }
        };

        fetchReaderDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Thông tin cá nhân',
        },
    ];

    return (
        <>
            {contextHolder}

            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Thông tin cá nhân</h1>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <Breadcrumb items={items} />
                            </div>
                        </div>
                    </div>
                </div>
            </Parallax>

            <div className="container sectionspace">
                <div className="row mb-4">
                    <div className="col-12">
                        <SectionHeader title={<h2 className="mb-0">Đổi mật khẩu</h2>} subtitle="Thông tin cá nhân" />
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="form-group mb-4">
                                <label htmlFor="cardNumber">Số thẻ</label>
                                <Input
                                    id="cardNumber"
                                    name="cardNumber"
                                    size="large"
                                    value={readerDetails.cardNumber}
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="oldPassword">Mật khẩu cũ</label>
                                <Input.Password
                                    id="oldPassword"
                                    name="oldPassword"
                                    size="large"
                                    status={formik.touched.oldPassword && formik.errors.oldPassword ? 'error' : ''}
                                    placeholder="Mật khẩu cũ"
                                    minLength="6"
                                    value={formik.values.oldPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.oldPassword && formik.errors.oldPassword && (
                                    <div className="text-danger">{formik.errors.oldPassword}</div>
                                )}
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="password">Mật khẩu mới</label>
                                <Input.Password
                                    id="password"
                                    name="password"
                                    size="large"
                                    status={formik.touched.password && formik.errors.password ? 'error' : ''}
                                    placeholder="Mật khẩu mới"
                                    minLength="6"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.password && formik.errors.password && (
                                    <div className="text-danger">{formik.errors.password}</div>
                                )}
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="repeatPassword">Xác nhận mật khẩu mới</label>
                                <Input.Password
                                    id="repeatPassword"
                                    name="repeatPassword"
                                    size="large"
                                    status={
                                        formik.touched.repeatPassword && formik.errors.repeatPassword ? 'error' : ''
                                    }
                                    placeholder="Xác nhận mật khẩu mới"
                                    minLength="6"
                                    value={formik.values.repeatPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.repeatPassword && formik.errors.repeatPassword && (
                                    <div className="text-danger">{formik.errors.repeatPassword}</div>
                                )}
                            </div>

                            <div className="form-group mb-4">
                                <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                                    Xác nhận Thay đổi mật khẩu
                                </Button>
                            </div>

                            <span>
                                <i style={{ color: '#ff8300' }}>Chú ý:</i> Muốn thay đổi mật khẩu, bạn cần nhập mật khẩu
                                cũ và thông tin mật khẩu mới. Mật khẩu mới và Xác nhận mật khẩu mới phải giống nhau.
                            </span>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group mb-4">
                                <label htmlFor="fullName">Họ tên</label>
                                <Input id="fullName" name="fullName" size="large" value={readerDetails.fullName} />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="email">Email</label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    size="large"
                                    value={readerDetails.email}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="phoneNumber">Số điện thoại</label>
                                <Input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    size="large"
                                    value={readerDetails.phoneNumber}
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="gender">Giới tính</label>
                                <Input id="gender" name="gender" size="large" value={readerDetails.gender} />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="birthDate">Ngày sinh</label>
                                <Input id="birthDate" name="birthDate" size="large" value={readerDetails.dateOfBirth} />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="address">Địa chỉ</label>
                                <TextArea
                                    rows={4}
                                    id="address"
                                    name="address"
                                    value={readerDetails.address}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="cardStatus">Trạng thái thẻ</label>
                                <Input id="cardStatus" name="cardStatus" size="large" value={readerDetails.status} />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="cardRegistrationDate">Ngày đăng ký thẻ</label>
                                <Input
                                    id="cardRegistrationDate"
                                    name="cardRegistrationDate"
                                    size="large"
                                    value={readerDetails.createdDate}
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="cardExpiryDate">Ngày hết hạn thẻ</label>
                                <Input
                                    id="cardExpiryDate"
                                    name="cardExpiryDate"
                                    size="large"
                                    value={readerDetails.expiryDate}
                                />
                            </div>

                            <span>
                                <i style={{ color: '#ff8300' }}>Chú ý:</i> Muốn thay đổi thông tin cá nhân, bạn cần liên
                                hệ với QLTV để thực hiện.
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default UserProfile;
