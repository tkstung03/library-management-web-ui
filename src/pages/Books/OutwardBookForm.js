import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, DatePicker, message, Select, Space, Table } from 'antd';
import { FaPlusCircle } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import queryString from 'query-string';
import dayjs from 'dayjs';
import FormInput from '~/components/FormInput';
import { handleError } from '~/utils/errorHandler';
import { checkIdIsNumber } from '~/utils/helper';
import {
    createExportReceipt,
    generateReceiptNumber,
    getExportReceiptById,
    updateExportReceipt,
} from '~/services/exportReceiptService';
import { getBooks, getBooksByIds } from '~/services/bookService';
import FormTextArea from '~/components/FormTextArea';

const defaultValue = {
    receiptNumber: '',
    exportDate: dayjs(),
    exportReason: '',
    bookIds: [],
};

const validationSchema = yup.object({
    receiptNumber: yup.string().required('Vui lòng nhập số phiếu xuất'),

    exportDate: yup.mixed().required('Vui lòng chọn ngày xuất'),

    bookIds: yup.array().min(1, 'Bạn phải chọn ít nhất một cuốn sách'),
});

function OutwardBookForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [isBooksLoading, setIsBooksLoading] = useState(true);

    const [selectedBookId, setSelectedBookId] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const formattedValues = {
                ...values,
                exportDate: values.exportDate ? values.exportDate.format('YYYY-MM-DD') : null,
            };

            let response;
            if (id) {
                response = await updateExportReceipt(id, formattedValues);
            } else {
                response = await createExportReceipt(formattedValues);
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

    const fetchBooks = async (keyword = '') => {
        setIsBooksLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'bookCode', bookCondition: 'AVAILABLE' });
            const response = await getBooks(params);
            const { items } = response.data.data;
            setBooks(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải sách.');
        } finally {
            setIsBooksLoading(false);
        }
    };

    const fetchSelectedBooks = async (ids) => {
        try {
            const response = await getBooksByIds(ids);
            const { data } = response.data;
            setSelectedBooks(data);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải sách.');
        }
    };

    const handleAddNewColum = () => {
        if (!selectedBookId) {
            messageApi.error('Bạn phải chọn một cuốn sách');
            return;
        }

        const currentBooks = formik.values.bookIds;
        if (currentBooks.includes(selectedBookId)) {
            messageApi.error('Cuốn sách đã tồn tại trong danh sách');
            return;
        }

        const selectedBook = books.find((book) => book.id === selectedBookId);
        if (!selectedBook) {
            messageApi.error('Không tìm thấy thông tin của cuốn sách');
            return;
        }

        const updatedBooks = [...currentBooks, selectedBookId];
        formik.setFieldValue('bookIds', updatedBooks);

        const updatedSelectedBooks = [...selectedBooks, selectedBook];
        setSelectedBooks(updatedSelectedBooks);

        setSelectedBookId(null);
    };

    const handleDeleteColum = (selectedBookId) => {
        const currentBooks = formik.values.bookIds;
        const updatedBooks = currentBooks.filter((bookId) => bookId !== selectedBookId);
        formik.setFieldValue('bookIds', updatedBooks);

        const updatedSelectedBooks = selectedBooks.filter((book) => book.id !== selectedBookId);
        setSelectedBooks(updatedSelectedBooks);
    };

    useEffect(() => {
        fetchBooks();
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
                navigate('/admin/books/outward');
                return;
            }

            try {
                const response = await getExportReceiptById(id);
                const { receiptNumber, exportDate, exportReason, bookIds } = response.data.data;

                formik.setValues({
                    receiptNumber,
                    exportDate: exportDate ? dayjs(exportDate) : null,
                    exportReason,
                    bookIds,
                });
                fetchSelectedBooks(bookIds);
            } catch (error) {
                messageApi.error('Có lỗi xảy ra khi tải dữ liệu phiếu xuất.');
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const columns = [
        {
            title: 'Số ĐKCB',
            dataIndex: 'bookCode',
            key: 'bookCode',
        },
        {
            title: 'Nhan đề',
            dataIndex: 'bookDefinition',
            key: 'title',
            render: ({ title }) => title,
        },
        {
            title: 'Năm xuất bản',
            dataIndex: 'bookDefinition',
            key: 'publishingYear',
            render: ({ publishingYear }) => publishingYear || 'N/A',
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

            <h2>{id ? 'Sửa phiếu xuất' : 'Thêm phiếu xuất'}</h2>

            <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                    <FormInput
                        id="receiptNumber"
                        label="Số phiếu xuất"
                        className="col-md-6"
                        helperText="Số phiếu xuất nên nhập theo định dạng PX + số, ví dụ PX0001"
                        formik={formik}
                        required
                    />

                    <div className="col-md-3">
                        <label htmlFor="exportDate">
                            <span className="text-danger">*</span> Ngày xuất:
                        </label>
                        <DatePicker
                            id="exportDate"
                            name="exportDate"
                            value={formik.values.exportDate}
                            onChange={(date) => formik.setFieldValue('exportDate', date)}
                            onBlur={() => formik.setFieldTouched('exportDate', true)}
                            status={formik.touched.exportDate && formik.errors.exportDate ? 'error' : undefined}
                            className="w-100"
                        />
                        <div className="text-danger">{formik.touched.exportDate && formik.errors.exportDate}</div>
                    </div>

                    <FormTextArea id="exportReason" label="Lý do xuất" className="col-md-9" rows={3} formik={formik} />

                    <div className="col-md-6">
                        <Select
                            showSearch
                            allowClear
                            onSearch={fetchBooks}
                            filterOption={false}
                            name="selectBooks"
                            placeholder="Chọn sách"
                            style={{ width: '100%' }}
                            options={books.map((book) => ({
                                label: book.bookCode + ' - ' + book.bookDefinition.title,
                                value: book.id,
                            }))}
                            loading={isBooksLoading}
                            value={selectedBookId}
                            onChange={(value) => setSelectedBookId(value)}
                        />
                    </div>

                    <div className="col-md-3">
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
                            dataSource={selectedBooks}
                            pagination={false}
                        />
                        <div className="text-danger">{formik.touched.bookIds && formik.errors.bookIds}</div>
                    </div>

                    <div className="col-md-12 text-end">
                        <Space>
                            <Button onClick={() => navigate('/admin/books/outward')}>Quay lại</Button>
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

export default OutwardBookForm;
