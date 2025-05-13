import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, DatePicker, Divider, InputNumber, message, Select, Space, Table } from 'antd';
import { FaPlusCircle } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import queryString from 'query-string';
import dayjs from 'dayjs';
import FormInput from '~/components/FormInput';
import { getBookDefinitions, getBookDefinitionsByIds } from '~/services/bookDefinitionService';
import {
    createImportReceipt,
    generateReceiptNumber,
    getImportReceiptById,
    updateImportReceipt,
} from '~/services/importReceiptService';
import { handleError } from '~/utils/errorHandler';
import { checkIdIsNumber } from '~/utils/helper';
const { Option } = Select;

const defaultValue = {
    receiptNumber: '',
    importDate: dayjs(),
    generalRecordNumber: '',
    fundingSource: '',
    importReason: '',
    bookRequestDtos: [],
};

const validationSchema = yup.object({
    receiptNumber: yup.string().required('Vui lòng nhập số phiếu nhập'),

    importDate: yup.mixed().required('Vui lòng chọn ngày nhập'),

    fundingSource: yup.string().required('Vui lòng chọn nguồn cấp phát'),

    bookRequestDtos: yup.array().min(1, 'Bạn phải chọn ít nhất một biên mục để nhập'),
});

function InwardBookForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bookDefinitions, setBookDefinitions] = useState([]);
    const [isBookDefinitionsLoading, setIsBookDefinitionsLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [selectedBookDefinitionId, setSelectedBookDefinitionId] = useState(null);
    const [selectedBookDefinitions, setSelectedBookDefinitions] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const formattedValues = {
                ...values,
                importDate: values.importDate ? values.importDate.format('YYYY-MM-DD') : null,
            };

            let response;
            if (id) {
                response = await updateImportReceipt(id, formattedValues);
            } else {
                response = await createImportReceipt(formattedValues);
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

    const fetchBookDefinitions = async (keyword = '') => {
        setIsBookDefinitionsLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'title', activeFlag: true });
            const response = await getBookDefinitions(params);
            const { items } = response.data.data;
            setBookDefinitions(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải biên mục.');
        } finally {
            setIsBookDefinitionsLoading(false);
        }
    };

    const fetchSelectedBookDefinitions = async (bookList) => {
        try {
            const bookIds = bookList.map((item) => item.bookDefinitionId);
            const response = await getBookDefinitionsByIds(bookIds);
            const { data: books } = response.data;

            const updatedBooks = bookList.map((item) => {
                const bookDetails = books.find((book) => book.id === item.bookDefinitionId);
                return {
                    ...item,
                    ...bookDetails,
                };
            });

            setSelectedBookDefinitions(updatedBooks);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải biên mục.');
        }
    };

    const handleAddNewColum = () => {
        if (!selectedBookDefinitionId) {
            messageApi.error('Bạn phải chọn một biên mục');
            return;
        }
        if (quantity < 1) {
            messageApi.error('Số lượng phải lớn hơn 0');
            return;
        }

        const currentBooks = formik.values.bookRequestDtos;
        if (currentBooks.some((book) => book.bookDefinitionId === selectedBookDefinitionId)) {
            messageApi.error('Biên mục đã tồn tại trong danh sách');
            return;
        }

        const selectedBookDefinition = bookDefinitions.find((book) => book.id === selectedBookDefinitionId);
        if (!selectedBookDefinition) {
            messageApi.error('Không tìm thấy thông tin của biên mục');
            return;
        }

        const updatedBooks = [...currentBooks, { quantity, bookDefinitionId: selectedBookDefinitionId }];
        formik.setFieldValue('bookRequestDtos', updatedBooks);

        const updatedSelectedBookDefinitions = [...selectedBookDefinitions, { quantity, ...selectedBookDefinition }];
        setSelectedBookDefinitions(updatedSelectedBookDefinitions);

        setSelectedBookDefinitionId(null);
        setQuantity(1);
    };

    const handleDeleteColum = (selectedId) => {
        const currentBooks = formik.values.bookRequestDtos;
        const updatedBooks = currentBooks.filter((book) => book.bookDefinitionId !== selectedId);
        formik.setFieldValue('bookRequestDtos', updatedBooks);

        const updatedSelectedBookDefinitions = selectedBookDefinitions.filter((book) => book.id !== selectedId);
        setSelectedBookDefinitions(updatedSelectedBookDefinitions);
    };

    useEffect(() => {
        fetchBookDefinitions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                try {
                    const response = await generateReceiptNumber();
                    if (response.status === 200) {
                        formik.setFieldValue('receiptNumber', response.data.data);
                    }
                } catch (error) {}
                return;
            }

            if (!checkIdIsNumber(id)) {
                navigate('/admin/books/inward');
                return;
            }

            try {
                const response = await getImportReceiptById(id);
                const { receiptNumber, importDate, generalRecordNumber, fundingSource, importReason, books } =
                    response.data.data;

                formik.setValues({
                    receiptNumber,
                    importDate: importDate ? dayjs(importDate) : null,
                    generalRecordNumber,
                    fundingSource,
                    importReason,
                    bookRequestDtos: books,
                });

                fetchSelectedBookDefinitions(books);
            } catch (error) {
                messageApi.error('Không thể tải thông tin phiếu nhập');
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const columns = [
        {
            title: 'Nhan đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Loại sách',
            dataIndex: 'category',
            key: 'category',
            render: (category) => category?.name || 'N/A',
        },
        {
            title: 'Tên tác giả',
            dataIndex: 'authors',
            key: 'authors',
            render: (authors) =>
                authors.length > 0
                    ? authors.map((author, index) => (
                          <span key={author.id || index}>
                              {author.name}
                              {index < authors.length - 1 && ', '}
                          </span>
                      ))
                    : 'N/A',
        },
        {
            title: 'Nhà xuất bản',
            dataIndex: 'publisher',
            key: 'publisher',
            render: (publisher) => publisher?.name || 'N/A',
        },
        {
            title: 'Năm xuất bản',
            dataIndex: 'publishingYear',
            key: 'publishingYear',
            render: (publishingYear) => publishingYear || 'N/A',
        },
        {
            title: 'Số bản',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button type="text" danger icon={<FaRegTrashAlt />} onClick={() => handleDeleteColum(record.id)} />
            ),
        },
    ];

    return (
        <div>
            {contextHolder}

            <h2>{id ? 'Sửa phiếu nhập' : 'Thêm phiếu nhập'}</h2>

            <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                    <FormInput
                        id="receiptNumber"
                        label="Số phiếu nhập"
                        className="col-md-6"
                        helperText="Số phiếu nhập nên nhập theo định dạng PN + số, ví dụ PN0001"
                        formik={formik}
                        required
                    />

                    <div className="col-md-3">
                        <label htmlFor="importDate">
                            <span className="text-danger">*</span> Ngày nhập:
                        </label>
                        <DatePicker
                            id="importDate"
                            name="importDate"
                            value={formik.values.importDate}
                            onChange={(date) => formik.setFieldValue('importDate', date)}
                            onBlur={() => formik.setFieldTouched('importDate', true)}
                            status={formik.touched.importDate && formik.errors.importDate ? 'error' : undefined}
                            className="w-100"
                        />
                        <div className="text-danger">{formik.touched.importDate && formik.errors.importDate}</div>
                    </div>

                    <div className="col-md-3">
                        <label htmlFor="fundingSource">
                            <span className="text-danger">*</span> Nguồn cấp:
                        </label>
                        <Select
                            id="fundingSource"
                            name="fundingSource"
                            value={formik.values.fundingSource}
                            onChange={(value) => formik.setFieldValue('fundingSource', value)}
                            onBlur={formik.handleBlur}
                            status={formik.touched.fundingSource && formik.errors.fundingSource ? 'error' : undefined}
                            className="w-100"
                        >
                            <Option value="Trường tự mua">Trường tự mua</Option>
                            <Option value="PGD cấp phát">PGD cấp phát</Option>
                            <Option value="SGD cấp phát">SGD cấp phát</Option>
                            <Option value="Biếu, tặng, quyên góp">Biếu, tặng, quyên góp</Option>
                            <Option value="Khác">Khác</Option>
                        </Select>
                        <div className="text-danger">{formik.touched.fundingSource && formik.errors.fundingSource}</div>
                    </div>

                    <FormInput
                        id="generalRecordNumber"
                        label="Số vào sổ tổng quát"
                        className="col-md-6"
                        formik={formik}
                    />

                    <FormInput id="importReason" label="Lý do nhập" className="col-md-6" formik={formik} />

                    <div className="col-md-6">
                        <Select
                            showSearch
                            allowClear
                            onSearch={fetchBookDefinitions}
                            filterOption={false}
                            name="selectBookDefinition"
                            placeholder="Chọn biên mục sách"
                            style={{ width: '100%' }}
                            options={bookDefinitions}
                            loading={isBookDefinitionsLoading}
                            value={selectedBookDefinitionId}
                            fieldNames={{ label: 'title', value: 'id' }}
                            onChange={(value) => setSelectedBookDefinitionId(value)}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider className="my-2" />
                                    <Space className="py-2 px-1 pt-0">
                                        <a
                                            className="d-flex align-items-center"
                                            href="/admin/book-definitions/new"
                                            target="_blank"
                                        >
                                            <FaPlus />
                                            Thêm mới
                                        </a>
                                    </Space>
                                </>
                            )}
                        />
                    </div>

                    <div className="col-md-3">
                        <InputNumber
                            min={1}
                            max={100}
                            name="txtQuantity"
                            className="w-100"
                            value={quantity}
                            onChange={(value) => setQuantity(value)}
                        />
                    </div>

                    <div className="col-lg-3">
                        <Button type="primary" icon={<FaPlusCircle />} onClick={handleAddNewColum}>
                            Thêm dòng mới
                        </Button>
                    </div>

                    <div className="col-md-12">
                        <Table
                            bordered
                            rowKey="id"
                            scroll={{ x: 'max-content' }}
                            columns={columns}
                            dataSource={selectedBookDefinitions}
                            pagination={false}
                        />
                        <div className="text-danger">
                            {formik.touched.bookRequestDtos && formik.errors.bookRequestDtos}
                        </div>
                    </div>

                    <div className="col-md-12 text-end">
                        <Space>
                            <Button onClick={() => navigate('/admin/books/inward')}>Quay lại</Button>
                            <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                                Lưu
                            </Button>
                        </Space>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default InwardBookForm;
