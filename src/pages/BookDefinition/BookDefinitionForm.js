import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as yup from 'yup';
import queryString from 'query-string';
import { Button, Image, message, Space, Upload } from 'antd';
import images from '~/assets';
import { handleError } from '~/utils/errorHandler';
import { checkIdIsNumber } from '~/utils/helper';
import { getCategories } from '~/services/categoryService';
import { getPublishers } from '~/services/publisherService';
import { getBookSets } from '~/services/bookSetService';
import { getAuthors } from '~/services/authorService';
import { getClassificationSymbols } from '~/services/classificationSymbolService';
import { createBookDefinition, getBookDefinitionById, updateBookDefinition } from '~/services/bookDefinitionService';
import FormInput from '~/components/FormInput';
import FormTextArea from '~/components/FormTextArea';
import FormSelect from '~/components/FormSelect';

const defaultValue = {
    title: '',
    categoryId: null,
    authorIds: null,
    classificationSymbolId: null,
    publisherId: null,
    publicationPlace: '',
    bookCode: '',
    publishingYear: '',
    edition: '',
    pageCount: null,
    price: null,
    referencePrice: null,
    bookSize: '',
    parallelTitle: '',
    subtitle: '',
    additionalMaterial: '',
    summary: '',
    isbn: '',
    keywords: '',
    language: '',
    additionalInfo: '',
    series: '',
    image: null,
    imageUrl: null,
};

const validationSchema = yup.object({
    title: yup.string().required('Tiêu đề là bắt buộc'),

    categoryId: yup.number().nullable().required('Danh mục là bắt buộc').typeError('Danh mục phải là số hợp lệ'),

    authorIds: yup
        .array()
        .of(yup.number().nullable().typeError('Tác giả phải là số hợp lệ'))
        .nullable()
        .typeError('Danh sách tác giả không hợp lệ'),

    publisherId: yup.number().nullable().typeError('Nhà xuất bản phải là số hợp lệ'),

    classificationSymbolId: yup.number().nullable().typeError('Kí hiệu phân loại phải là số hợp lệ'),

    publicationPlace: yup.string().nullable(),

    bookCode: yup.string().required('Kí hiệu tên sách là bắt buộc'),

    publishingYear: yup
        .number()
        .nullable()
        .typeError('Năm xuất bản phải là số hợp lệ')
        .min(1900, 'Năm xuất bản phải lớn hơn 1900')
        .max(dayjs().year(), `Năm xuất bản không được lớn hơn ${dayjs().year()}`),

    edition: yup.string().nullable(),

    pageCount: yup.number().nullable().typeError('Số trang phải là số hợp lệ').min(1, 'Số trang phải ít nhất là 1'),

    price: yup.number().nullable().typeError('Giá bán phải là số hợp lệ').positive('Giá bán phải là số dương'),

    referencePrice: yup
        .number()
        .nullable()
        .typeError('Giá tham khảo phải là số hợp lệ')
        .positive('Giá tham khảo phải là số dương'),

    bookSize: yup.string().nullable(),

    parallelTitle: yup.string().nullable(),

    subtitle: yup.string().nullable(),

    additionalMaterial: yup.string().nullable(),

    summary: yup.string().nullable(),

    isbn: yup
        .string()
        .nullable()
        .matches(/^(97(8|9))?\d{9}(\d|X)$/, 'ISBN phải đúng định dạng hợp lệ'),

    keywords: yup.string().nullable(),

    language: yup.string().nullable(),

    additionalInfo: yup.string().nullable(),

    series: yup.string().nullable(),

    imageUrl: yup.string().nullable().url(),
});

const BookDefinitionForm = ({ mode }) => {
    const isEditMode = mode === 'edit';

    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [categories, setCategories] = useState([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    const [authors, setAuthors] = useState([]);
    const [isAuthorsLoading, setIsAuthorsLoading] = useState(true);

    const [publishers, setPublishers] = useState([]);
    const [isPublishersLoading, setIsPublishersLoading] = useState(true);

    const [bookSets, setBookSets] = useState([]);
    const [isBookSetsLoading, setIsBookSetsLoading] = useState(true);

    const [classificationSymbols, setClassificationSymbols] = useState([]);
    const [isClassificationSymbolsLoading, setIsClassificationSymbolsLoading] = useState(true);

    const [previousImage, setPreviousImage] = useState(images.placeimg);

    const handleUploadChange = (info) => {
        if (info.file.originFileObj) {
            const url = URL.createObjectURL(info.file.originFileObj);

            setPreviousImage(url);
            formik.setFieldValue('image', info.file.originFileObj);
        }
    };

    const uploadProps = {
        name: 'file',
        accept: 'image/*',
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                alert('Bạn chỉ có thể upload file hình ảnh!');
            }
            return isImage;
        },
        showUploadList: false,
        onChange: handleUploadChange,
        customRequest: ({ file, onSuccess }) => {
            onSuccess('ok');
        },
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            let response;
            if (isEditMode) {
                response = await updateBookDefinition(id, values);
            } else {
                response = await createBookDefinition(values);
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

    const fetchCategories = async (keyword = '') => {
        setIsCategoriesLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'categoryName', activeFlag: true });
            const response = await getCategories(params);
            const { items } = response.data.data;
            setCategories(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải danh mục.');
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const fetchAuthors = async (keyword = '') => {
        setIsAuthorsLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'fullName', activeFlag: true });
            const response = await getAuthors(params);
            const { items } = response.data.data;
            setAuthors(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải tác giả.');
        } finally {
            setIsAuthorsLoading(false);
        }
    };

    const fetchPublishers = async (keyword = '') => {
        setIsPublishersLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'name', activeFlag: true });
            const response = await getPublishers(params);
            const { items } = response.data.data;
            setPublishers(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải nhà xuất bản.');
        } finally {
            setIsPublishersLoading(false);
        }
    };

    const fetchBookSets = async (keyword = '') => {
        setIsBookSetsLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'name', activeFlag: true });
            const response = await getBookSets(params);
            const { items } = response.data.data;
            setBookSets(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải bộ sách.');
        } finally {
            setIsBookSetsLoading(false);
        }
    };

    const fetchClassificationSymbols = async (keyword = '') => {
        setIsClassificationSymbolsLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'name', activeFlag: true });
            const response = await getClassificationSymbols(params);
            const { items } = response.data.data;
            setClassificationSymbols(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải kí hiệu phân loại.');
        } finally {
            setIsClassificationSymbolsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchAuthors();
        fetchPublishers();
        fetchBookSets();
        fetchClassificationSymbols();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (id) {
            if (!checkIdIsNumber(id)) {
                navigate('/admin/book-definitions');
                return;
            }

            // Nếu có id, lấy thông tin biên mục để sửa
            getBookDefinitionById(id)
                .then((response) => {
                    const {
                        title = '',
                        price = '',
                        isbn = '',
                        publishingYear = '',
                        edition = '',
                        referencePrice = '',
                        publicationPlace = '',
                        bookCode = '',
                        pageCount = '',
                        bookSize = '',
                        parallelTitle = '',
                        summary = '',
                        subtitle = '',
                        additionalMaterial = '',
                        keywords = '',
                        language = '',
                        imageUrl = '',
                        series = '',
                        additionalInfo = '',
                        authors = [],
                        publisher = null,
                        bookSet = null,
                        classificationSymbol = null,
                        category = {},
                    } = response.data.data;
                    formik.setValues({
                        title,
                        pageCount,
                        price,
                        referencePrice,
                        publicationPlace,
                        bookCode,
                        publishingYear,
                        edition,
                        bookSize,
                        parallelTitle,
                        subtitle,
                        additionalMaterial,
                        summary,
                        isbn,
                        keywords,
                        language,
                        additionalInfo,
                        series,
                        imageUrl,
                        authorIds: authors ? authors.map((author) => author.id) : [],
                        publisherId: publisher ? publisher.id : null,
                        bookSetId: bookSet ? bookSet.id : null,
                        categoryId: category.id,
                        classificationSymbolId: classificationSymbol ? classificationSymbol.id : null,
                    });
                    setPreviousImage(imageUrl);
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
            <>
                {isEditMode && <h2>Chỉnh sửa biên mục</h2>}
                {mode === 'copy' && <h2>Nhân bản biên mục</h2>}
                {mode === 'new' && <h2>Thêm mới biên mục</h2>}
            </>

            <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-10">
                        <div className="row g-3">
                            <FormInput id="title" label="Nhan đề" className={'col-md-8'} formik={formik} required />

                            <FormSelect
                                required
                                id="categoryId"
                                label="Danh mục"
                                className="col-md-4"
                                formik={formik}
                                options={categories}
                                loading={isCategoriesLoading}
                                onSearch={fetchCategories}
                                fieldNames={{ label: 'categoryName', value: 'id' }}
                            />

                            <FormSelect
                                multiple
                                id="authorIds"
                                label="Tác giả"
                                className="col-md-4"
                                formik={formik}
                                options={authors}
                                loading={isAuthorsLoading}
                                onSearch={fetchAuthors}
                                fieldNames={{ label: 'fullName', value: 'id' }}
                            />

                            <FormSelect
                                id="publisherId"
                                label="Nhà xuất bản"
                                className="col-md-4"
                                formik={formik}
                                options={publishers}
                                loading={isPublishersLoading}
                                onSearch={fetchPublishers}
                                fieldNames={{ label: 'name', value: 'id' }}
                            />

                            <FormInput
                                id="publicationPlace"
                                label="Nơi xuất bản"
                                formik={formik}
                                className="col-md-4"
                            />

                            <FormSelect
                                id="classificationSymbolId"
                                label="Kí hiệu phân loại"
                                className="col-md-4"
                                formik={formik}
                                options={classificationSymbols}
                                loading={isClassificationSymbolsLoading}
                                onSearch={fetchClassificationSymbols}
                                fieldNames={{ label: 'name', value: 'id' }}
                            />

                            <FormInput
                                id="bookCode"
                                label="Kí hiệu tên sách"
                                formik={formik}
                                className="col-md-4"
                                required
                            />

                            <FormInput id="publishingYear" label="Năm xuất bản" formik={formik} className="col-md-4" />

                            <FormInput id="edition" label="Lần xuất bản" formik={formik} className="col-md-4" />

                            <FormInput id="pageCount" label="Số trang" formik={formik} className="col-md-4" />

                            <FormInput id="price" label="Giá bìa" formik={formik} className="col-md-4" />

                            <FormInput id="referencePrice" label="Giá tham khảo" formik={formik} className="col-md-4" />

                            <FormInput id="bookSize" label="Khổ sách" formik={formik} className="col-md-4" />

                            <FormSelect
                                id="bookSetId"
                                label="Bộ sách"
                                className="col-md-4"
                                formik={formik}
                                options={bookSets}
                                loading={isBookSetsLoading}
                                onSearch={fetchBookSets}
                                fieldNames={{ label: 'name', value: 'id' }}
                            />
                        </div>
                    </div>

                    <div className="col-md-2 text-center">
                        <Image width={200} src={previousImage} fallback={images.placeimg} />

                        <Upload {...uploadProps}>
                            <Button type="text">Chọn ảnh</Button>
                        </Upload>
                    </div>

                    <FormInput id="parallelTitle" label="Nhan đề song song" formik={formik} className="col-md-6" />

                    <FormInput id="subtitle" label="Phụ đề" formik={formik} className="col-md-6" />

                    <FormInput id="additionalMaterial" label="Tài liệu đi kèm" formik={formik} className="col-md-4" />

                    <FormInput id="isbn" label="Mã ISBN" formik={formik} className="col-md-4" />

                    <FormInput id="language" label="Ngôn ngữ" formik={formik} className="col-md-4" />

                    <FormInput id="additionalInfo" label="Thông tin khác" formik={formik} className="col-md-6" />

                    <FormInput id="series" label="Tùng thư" formik={formik} className="col-md-6" />

                    <FormTextArea id="summary" label="Tóm tắt" formik={formik} className="col-md-6" />

                    <FormTextArea id="keywords" label="Từ khóa tìm kiếm" formik={formik} className="col-md-6" />

                    <div className="col-md-12 text-end">
                        <Space>
                            <Button onClick={() => navigate('/admin/book-definitions')}>Quay lại</Button>
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

export default BookDefinitionForm;
