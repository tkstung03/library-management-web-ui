import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { Button, DatePicker, Input, message, Radio, Space } from 'antd';
import { handleError } from '~/utils/errorHandler';
import { checkIdIsNumber } from '~/utils/helper';
import { createAuthor, getAuthorById, updateAuthor } from '~/services/authorService';

const { TextArea } = Input;

const defaultValue = {
    fullName: '',
    code: '',
    penName: '',
    gender: 'MALE',
    dateOfBirth: null,
    dateOfDeath: null,
    title: '',
    residence: '',
    address: '',
    notes: '',
};

const validationSchema = yup.object({
    fullName: yup.string().required('Họ tên là bắt buộc'),

    code: yup.string().required('Mã hiệu là bắt buộc'),
});

function AuthorForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            let response;
            if (id) {
                response = await updateAuthor(id, values);
            } else {
                response = await createAuthor(values);
            }

            if (response.status === 200) {
                messageApi.success(response.data.data.message);
            } else if (response.status === 201) {
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

    useEffect(() => {
        if (id) {
            if (!checkIdIsNumber(id)) {
                navigate('/admin/authors');
                return;
            }

            // Nếu có id, lấy thông tin tác giả để sửa
            getAuthorById(id)
                .then((response) => {
                    const {
                        fullName,
                        code,
                        penName,
                        gender,
                        dateOfBirth,
                        dateOfDeath,
                        title,
                        residence,
                        address,
                        notes,
                    } = response.data.data;

                    formik.setValues({
                        fullName,
                        code,
                        penName,
                        gender,
                        dateOfBirth: dateOfBirth ? dayjs(dateOfBirth) : null,
                        dateOfDeath: dateOfDeath ? dayjs(dateOfDeath) : null,
                        title,
                        residence,
                        address,
                        notes,
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <>
            {contextHolder}
            <h2>{id ? 'Chỉnh sửa tác giả' : 'Thêm mới tác giả'}</h2>

            <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="fullName">
                            <span className="text-danger">*</span> Họ tên:
                        </label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formik.values.fullName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.fullName && formik.errors.fullName ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.fullName && formik.errors.fullName}</div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="code">
                            <span className="text-danger">*</span> Mã hiệu:
                        </label>
                        <Input
                            id="code"
                            name="code"
                            value={formik.values.code}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.code && formik.errors.code ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.code && formik.errors.code}</div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="penName">Bí danh:</label>
                        <Input
                            id="penName"
                            name="penName"
                            value={formik.values.penName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.penName && formik.errors.penName ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.penName && formik.errors.penName}</div>
                    </div>
                    <div className="col-md-6">
                        <span>Giới tính:</span>
                        <div>
                            <Radio.Group
                                name="gender"
                                value={formik.values.gender}
                                onChange={(e) => formik.setFieldValue('gender', e.target.value)}
                                onBlur={formik.handleBlur}
                                status={formik.touched.gender && formik.errors.gender ? 'error' : undefined}
                            >
                                <Radio value={'MALE'} checked>
                                    Nam
                                </Radio>
                                <Radio value={'FEMALE'}>Nữ</Radio>
                                <Radio value={'OTHER'}>Khác</Radio>
                            </Radio.Group>
                        </div>
                        <div className="text-danger">{formik.touched.gender && formik.errors.gender}</div>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="dateOfBirth">Ngày sinh:</label>
                        <div>
                            <DatePicker
                                className="w-100"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formik.values.dateOfBirth}
                                onChange={(date, dateString) => formik.setFieldValue('dateOfBirth', date)}
                                status={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'error' : undefined}
                            />
                        </div>
                        <div className="text-danger">{formik.touched.dateOfBirth && formik.errors.dateOfBirth}</div>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="dateOfDeath">Ngày mất:</label>
                        <div>
                            <DatePicker
                                className="w-100"
                                id="dateOfDeath"
                                name="dateOfDeath"
                                value={formik.values.dateOfDeath}
                                onChange={(date, dateString) => formik.setFieldValue('dateOfDeath', date)}
                                status={formik.touched.dateOfDeath && formik.errors.dateOfDeath ? 'error' : undefined}
                            />
                        </div>
                        <div className="text-danger">{formik.touched.dateOfDeath && formik.errors.dateOfDeath}</div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="title">Chức danh:</label>
                        <Input
                            id="title"
                            name="title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.title && formik.errors.title ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.title && formik.errors.title}</div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="residence">Thường chú:</label>
                        <Input
                            id="residence"
                            name="residence"
                            value={formik.values.residence}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.residence && formik.errors.residence ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.residence && formik.errors.residence}</div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="address">Địa chỉ:</label>
                        <Input
                            autoComplete="off"
                            id="address"
                            name="address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.address && formik.errors.address ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.address && formik.errors.address}</div>
                    </div>
                    <div className="col-md-12">
                        <label htmlFor="notes">Ghi chú:</label>
                        <TextArea
                            rows={4}
                            id="notes"
                            name="notes"
                            value={formik.values.notes}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.notes && formik.errors.notes ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.notes && formik.errors.notes}</div>
                    </div>
                    <div className="col-md-12 text-end">
                        <Space>
                            <Button onClick={() => navigate('/admin/authors')}>Quay lại</Button>
                            <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                                Lưu
                            </Button>
                        </Space>
                    </div>
                </div>
            </form>
        </>
    );
}

export default AuthorForm;
