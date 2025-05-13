import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, message, Upload } from 'antd';
import { MdOutlineFileUpload } from 'react-icons/md';
import ReactQuill from 'react-quill';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { handleError } from '~/utils/errorHandler';
import { formats, modules as defaultModules } from '~/common/editorConfig';
import { getLibraryInfo, updateLibraryInfo } from '~/services/systemSettingService';
import { uploadImages } from '~/services/userService';
const { TextArea } = Input;

const defaultValue = {
    librarySymbol: '',
    libraryName: '',
    address: '',
    postalCode: '',
    countryCode: '',
    provinceCity: '',
    educationOffice: '',
    school: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    faxNumber: '',
    email: '',
    pageTitle: '',
    motto: '',
    introduction: '',
};

const validationSchema = yup.object({
    librarySymbol: yup.string().required('Vui lòng nhập kí hiệu thư viện.'),

    libraryName: yup.string().required('Vui lòng nhập tên thư viện.'),

    address: yup.string().required('Vui lòng nhập địa chỉ.'),

    countryCode: yup.string().required('Vui lòng nhập mã quốc gia.'),

    provinceCity: yup.string().required('Vui lòng nhập tên tỉnh/thành phố.'),

    educationOffice: yup.string().required('Vui lòng nhập thông tin phòng giáo dục.'),

    school: yup.string().required('Vui lòng nhập tên trường học.'),

    email: yup.string().email('Email không hợp lệ, vui lòng kiểm tra lại.').required('Vui lòng nhập email.'),

    phoneNumber: yup.string().required('Vui lòng nhập số điện thoại.'),
});

function LibraryInfo() {
    const reactQuillRef = useRef(null);

    const [fileList, setFileList] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    const handleUploadChange = ({ file, fileList }) => {
        setFileList(fileList);

        const { originFileObj } = file;
        if (!originFileObj) {
            return;
        }

        formik.setFieldValue('logo', originFileObj);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await updateLibraryInfo(values);
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

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async () => {
            if (input !== null && input.files !== null) {
                const file = input.files[0];
                const loadingMessage = message.loading({ content: 'Đang tải ảnh lên...', duration: 0 });
                try {
                    const response = await uploadImages([file]);
                    const quill = reactQuillRef.current;
                    if (quill && response.data) {
                        const range = quill.getEditorSelection();
                        range && quill.getEditor().insertEmbed(range.index, 'image', response.data.data[0]);
                        message.success({ content: 'Tải ảnh thành công!', duration: 2 });
                    }
                } catch (error) {
                    message.error({ content: 'Đã xảy ra lỗi khi tải ảnh lên.', duration: 2 });
                } finally {
                    if (loadingMessage) {
                        loadingMessage();
                    }
                }
            }
        };
    }, []);

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await getLibraryInfo();
                const { data } = response.data;
                if (data) {
                    formik.setValues(data);
                }
            } catch (error) {}
        };

        fetchEntities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const modules = {
        ...defaultModules,
        toolbar: {
            ...defaultModules.toolbar,
            handlers: {
                ...defaultModules.toolbar.handlers,
                image: imageHandler,
            },
        },
    };

    return (
        <>
            {contextHolder}

            <h2>Thiết lập thông tin thư viện</h2>

            <form onSubmit={formik.handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="librarySymbol">
                            <span className="text-danger">*</span> Kí hiệu thư viện:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="librarySymbol"
                            name="librarySymbol"
                            value={formik.values.librarySymbol}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.librarySymbol && formik.errors.librarySymbol ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.librarySymbol && formik.errors.librarySymbol}</div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="libraryName">
                            <span className="text-danger">*</span> Tên thư viện:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <TextArea
                            rows={2}
                            id="libraryName"
                            name="libraryName"
                            value={formik.values.libraryName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.libraryName && formik.errors.libraryName ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.libraryName && formik.errors.libraryName}</div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="address">
                            <span className="text-danger">*</span> Địa chỉ:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <TextArea
                            rows={2}
                            id="address"
                            name="address"
                            autoComplete="off"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.address && formik.errors.address ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.address && formik.errors.address}</div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="postalCode">Mã số bưu cục:</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="postalCode"
                            name="postalCode"
                            value={formik.values.postalCode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.postalCode && formik.errors.postalCode ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.postalCode && formik.errors.postalCode}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="countryCode">
                            <span className="text-danger">*</span> Mã quốc gia:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="countryCode"
                            name="countryCode"
                            value={formik.values.countryCode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.countryCode && formik.errors.countryCode ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.countryCode && formik.errors.countryCode}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="provinceCity">
                            <span className="text-danger">*</span> Tỉnh/Thành phố:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="provinceCity"
                            name="provinceCity"
                            value={formik.values.provinceCity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.provinceCity && formik.errors.provinceCity ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.provinceCity && formik.errors.provinceCity}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="educationOffice">
                            <span className="text-danger">*</span> Phòng GD:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="educationOffice"
                            name="educationOffice"
                            value={formik.values.educationOffice}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={
                                formik.touched.educationOffice && formik.errors.educationOffice ? 'error' : undefined
                            }
                        />
                        <div className="text-danger">
                            {formik.touched.educationOffice && formik.errors.educationOffice}
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="school">
                            <span className="text-danger">*</span> Trường:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="school"
                            name="school"
                            value={formik.values.school}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.school && formik.errors.school ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.school && formik.errors.school}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="phoneNumber">
                            <span className="text-danger">*</span> Số điện thoại:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formik.values.phoneNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.phoneNumber && formik.errors.phoneNumber ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.phoneNumber && formik.errors.phoneNumber}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="alternatePhoneNumber">Số điện thoại khác:</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="alternatePhoneNumber"
                            name="alternatePhoneNumber"
                            value={formik.values.alternatePhoneNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={
                                formik.touched.alternatePhoneNumber && formik.errors.alternatePhoneNumber
                                    ? 'error'
                                    : undefined
                            }
                        />
                        <div className="text-danger">
                            {formik.touched.alternatePhoneNumber && formik.errors.alternatePhoneNumber}
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="faxNumber">Số fax:</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="faxNumber"
                            name="faxNumber"
                            value={formik.values.faxNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.faxNumber && formik.errors.faxNumber ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.faxNumber && formik.errors.faxNumber}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="email">
                            <span className="text-danger">*</span> Email:
                        </label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="email"
                            name="email"
                            autoComplete="off"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.email && formik.errors.email ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.email && formik.errors.email}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="pageTitle">Tiêu đề trang:</label>
                    </div>
                    <div className="col-md-6">
                        <TextArea
                            rows={2}
                            id="pageTitle"
                            name="pageTitle"
                            value={formik.values.pageTitle}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.pageTitle && formik.errors.pageTitle ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.pageTitle && formik.errors.pageTitle}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="motto">Khẩu hiệu:</label>
                    </div>
                    <div className="col-md-6">
                        <TextArea
                            rows={2}
                            id="motto"
                            name="motto"
                            value={formik.values.motto}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            status={formik.touched.motto && formik.errors.motto ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.motto && formik.errors.motto}</div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label htmlFor="logo">Logo:</label>
                    </div>
                    <div className="col-md-6">
                        <Upload
                            accept="image/*"
                            fileList={fileList}
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={(file) => {
                                const isImage = file.type.startsWith('image/');
                                if (!isImage) {
                                    messageApi.error('Bạn chỉ có thể upload file hình ảnh!');
                                }
                                return isImage;
                            }}
                            onChange={handleUploadChange}
                            customRequest={() => false}
                        >
                            <Button icon={<MdOutlineFileUpload />}>Chọn hình ảnh</Button>
                        </Upload>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <span>Giới thiệu:</span>
                    </div>
                    <div className="col-md-6">
                        <ReactQuill
                            ref={reactQuillRef}
                            className="custom-quill"
                            placeholder="Nhập nội dung"
                            value={formik.values.introduction}
                            modules={modules}
                            formats={formats}
                            onChange={(value) => formik.setFieldValue('introduction', value)}
                            onBlur={() => formik.setFieldTouched('introduction', true)}
                        />
                        {formik.touched.introduction && formik.errors.introduction ? (
                            <div className="text-danger">{formik.errors.introduction}</div>
                        ) : null}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <span className="text-warning">(*):Không được phép để trống!</span>
                    </div>
                    <div className="col-md-6">
                        <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                            Lưu
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default LibraryInfo;
