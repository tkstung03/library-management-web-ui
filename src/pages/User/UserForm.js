import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import queryString from 'query-string';
import dayjs from 'dayjs';
import { Button, DatePicker, message, Space } from 'antd';
import { handleError } from '~/utils/errorHandler';
import FormInput from '~/components/FormInput';
import FormTextArea from '~/components/FormTextArea';
import FormSelect from '~/components/FormSelect';
import { getUserGroups } from '~/services/userGroupService';
import { createUser, getUserById, updateUser } from '~/services/userService';
import { REGEXP_FULL_NAME, REGEXP_PASSWORD, REGEXP_PHONE_NUMBER, REGEXP_USERNAME } from '~/common/commonConstants';

const statusOptions = [
    { value: 'ACTIVATED', label: 'Đã kích hoạt' },
    { value: 'DEACTIVATED', label: 'Chưa kích hoạt' },
    { value: 'SUSPENDED', label: 'Tạm dừng' },
];

const defaultValue = {
    username: '',
    password: '',
    userGroupId: null,
    expiryDate: dayjs(),
    status: statusOptions[0].value,
    fullName: '',
    position: '',
    email: '',
    phoneNumber: '',
    address: '',
    note: '',
};

const validationSchema = yup.object({
    username: yup
        .string()
        .matches(
            REGEXP_USERNAME,
            'Tên đăng nhập phải bắt đầu bằng chữ cái, từ 4-16 ký tự và chỉ chứa chữ cái thường hoặc số.',
        )
        .required('Tên đăng nhập là bắt buộc'),

    password: yup
        .string()
        .matches(REGEXP_PASSWORD, 'Mật khẩu phải có tối thiểu 6 ký tự, bao gồm ít nhất một chữ cái và một chữ số.')
        .nullable(),

    phoneNumber: yup
        .string()
        .matches(
            REGEXP_PHONE_NUMBER,
            'Số điện thoại phải bắt đầu bằng +84 hoặc 0, tiếp theo là mã nhà mạng hợp lệ và có 7-8 chữ số.',
        )
        .required('Số điện thoại là bắt buộc'),

    fullName: yup
        .string()
        .matches(REGEXP_FULL_NAME, 'Họ tên phải có ít nhất hai từ và không chứa ký tự đặc biệt.')
        .required('Họ tên là bắt buộc'),

    email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),

    userGroupId: yup.number().required('Nhóm người dùng là bắt buộc'),

    expiryDate: yup.mixed().nullable(),

    status: yup.string().nullable(),

    position: yup.string().nullable(),

    address: yup.string().nullable(),

    note: yup.string().nullable(),
});

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userGroups, setUserGroups] = useState([]);
    const [isUserGroupsLoading, setIsUserGroupsLoading] = useState(true);

    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            if (!id && !values.password) {
                setErrors({ password: 'Mật khẩu là bắt buộc' });
                setSubmitting(false);
                return;
            }

            const formattedValues = {
                ...values,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
            };

            let response;
            if (id) {
                response = await updateUser(id, formattedValues);
            } else {
                response = await createUser(formattedValues);
            }

            if (response.status === 200 || response.status === 201) {
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
        enableReinitialize: true,
    });

    const fetchUserGroups = async (keyword = '') => {
        setIsUserGroupsLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'name', activeFlag: true });
            const response = await getUserGroups(params);
            const { items } = response.data.data;
            setUserGroups(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải nhóm người dùng.');
        } finally {
            setIsUserGroupsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getUserById(id);
                const {
                    username,
                    password,
                    userGroup,
                    expiryDate,
                    status,
                    fullName,
                    position,
                    email,
                    phoneNumber,
                    address,
                    note,
                } = response.data.data;

                formik.setValues({
                    username,
                    password,
                    userGroupId: userGroup ? userGroup.id : null,
                    expiryDate: expiryDate ? dayjs(expiryDate) : null,
                    status,
                    fullName,
                    position,
                    email,
                    phoneNumber,
                    address,
                    note,
                });
            } catch (error) {
                messageApi.error(error.message || 'Có lỗi xảy ra khi tải thông tin người dùng.');
            }
        };

        if (id) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <>
            {contextHolder}

            {id ? <h2>Chỉnh sửa người dùng</h2> : <h2>Thêm mới người dùng</h2>}

            <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                    <FormInput
                        id="username"
                        label="Tên đăng nhập"
                        className={'col-md-6'}
                        formik={formik}
                        required
                        autoComplete="on"
                    />

                    <FormInput id="password" label="Mật khẩu" className={'col-md-6'} formik={formik} required={!id} />

                    <FormSelect
                        required
                        id="userGroupId"
                        label="Nhóm người dùng"
                        className="col-md-6"
                        formik={formik}
                        options={userGroups}
                        loading={isUserGroupsLoading}
                        onSearch={fetchUserGroups}
                        fieldNames={{ label: 'name', value: 'id' }}
                    />

                    <div className="col-md-6">
                        <label htmlFor="expiryDate">Hiệu lực đến ngày:</label>
                        <div>
                            <DatePicker
                                id="expiryDate"
                                name="expiryDate"
                                value={formik.values.expiryDate}
                                onChange={(date) => formik.setFieldValue('expiryDate', date)}
                                onBlur={() => formik.setFieldTouched('expiryDate', true)}
                                status={formik.touched.expiryDate && formik.errors.expiryDate ? 'error' : undefined}
                                className="w-100"
                            />
                        </div>
                        <div className="text-danger">{formik.touched.expiryDate && formik.errors.expiryDate}</div>
                    </div>

                    <FormSelect
                        required
                        id="status"
                        label="Trạng thái"
                        className="col-md-6"
                        formik={formik}
                        options={statusOptions}
                    />

                    <FormInput id="fullName" label="Họ tên" formik={formik} className="col-md-6" required />

                    <FormInput
                        id="email"
                        label="Email"
                        formik={formik}
                        className="col-md-6"
                        required
                        autoComplete="on"
                    />

                    <FormInput id="phoneNumber" label="Số điện thoại" formik={formik} className="col-md-6" required />

                    <FormInput id="position" label="Chức vụ" formik={formik} className="col-md-6" />

                    <FormInput id="address" label="Địa chỉ" formik={formik} className="col-md-6" autoComplete="on" />

                    <FormTextArea id="note" label="Ghi chú" formik={formik} className="col-md-12" />

                    <div className="col-md-12 text-end">
                        <Space>
                            <Button onClick={() => navigate('/admin/users')}>Quay lại</Button>
                            <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                                Lưu
                            </Button>
                        </Space>
                    </div>
                </div>
            </form>
        </>
    );
};

export default UserForm;
