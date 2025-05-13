import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, DatePicker, message, Select, Space, Table } from 'antd';
import { FaPlusCircle } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import queryString from 'query-string';
import dayjs from 'dayjs';
import FormInput from '~/components/FormInput';
import FormTextArea from '~/components/FormTextArea';
import { handleError } from '~/utils/errorHandler';
import { getBooks, getBooksByCodes } from '~/services/bookService';
import {
    createBorrowReceipt,
    generateReceiptNumber,
    getBorrowReceiptByCartId,
    getBorrowReceiptById,
    updateBorrowReceipt,
} from '~/services/borrowReceiptService';
import { checkIdIsNumber } from '~/utils/helper';
import { getReaders } from '~/services/readerService';

const defaultValue = {
    receiptNumber: '',
    borrowDate: dayjs(),
    dueDate: dayjs().add(30, 'day'),
    note: '',
    readerId: null,
    books: [],
};

const validationSchema = yup.object({
    receiptNumber: yup.string().required('Số phiếu mượn là bắt buộc'),

    borrowDate: yup.date().nullable().required('Ngày mượn là bắt buộc').typeError('Ngày mượn không hợp lệ'),

    dueDate: yup
        .date()
        .nullable()
        .required('Ngày hẹn trả là bắt buộc')
        .typeError('Ngày hẹn trả không hợp lệ')
        .min(yup.ref('borrowDate'), 'Ngày hẹn trả phải sau ngày mượn'),

    note: yup.string(),

    readerId: yup.number().required('ID bạn đọc là bắt buộc'),

    books: yup.array().min(1, 'Bạn phải chọn ít nhất một cuốn sách'),
});

function BorrowBookForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [books, setBooks] = useState([]);
    const [isBooksLoading, setIsBooksLoading] = useState(true);

    const [readers, setReaders] = useState([]);
    const [isReadersLoading, setIsReadersLoading] = useState(true);

    const [selectedBookCode, setSelectedBookCode] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const formattedValues = {
                ...values,
                borrowDate: values.borrowDate ? values.borrowDate.format('YYYY-MM-DD') : null,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
            };

            let response;
            if (id) {
                response = await updateBorrowReceipt(id, formattedValues);
            } else {
                response = await createBorrowReceipt(formattedValues);
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

    const fetchReaders = async (keyword = '') => {
        setIsReadersLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'fullName' });
            const response = await getReaders(params);
            const { items } = response.data.data;
            setReaders(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải bạn đọc.');
        } finally {
            setIsReadersLoading(false);
        }
    };

    const fetchBooks = async (keyword = '') => {
        setIsBooksLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'title', bookCondition: 'AVAILABLE' });
            const response = await getBooks(params);
            const { items } = response.data.data;
            setBooks(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải sách.');
        } finally {
            setIsBooksLoading(false);
        }
    };

    const fetchSelectedBooks = async (codes) => {
        try {
            const response = await getBooksByCodes(codes);
            const { data } = response.data;
            setSelectedBooks(data);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải sách.');
        }
    };

    const handleAddNewColum = () => {
        if (!selectedBookCode) {
            messageApi.error('Bạn phải chọn một cuốn sách');
            return;
        }

        const currentBooks = formik.values.books;
        if (currentBooks.includes(selectedBookCode)) {
            messageApi.error('Cuốn sách đã tồn tại trong danh sách');
            return;
        }

        const selectedBook = books.find((book) => book.bookCode === selectedBookCode);
        if (!selectedBook) {
            messageApi.error('Không tìm thấy thông tin của cuốn sách');
            return;
        }

        const updatedBooks = [...currentBooks, selectedBookCode];
        formik.setFieldValue('books', updatedBooks);

        const updatedSelectedBooks = [...selectedBooks, selectedBook];
        setSelectedBooks(updatedSelectedBooks);

        setSelectedBookCode(null);
    };

    const handleDeleteColum = (selectedBookCode) => {
        const currentBooks = formik.values.books;
        const updatedBooks = currentBooks.filter((bookCode) => bookCode !== selectedBookCode);
        formik.setFieldValue('books', updatedBooks);

        const updatedSelectedBooks = selectedBooks.filter((book) => book.bookCode !== selectedBookCode);
        setSelectedBooks(updatedSelectedBooks);
    };

    useEffect(() => {
        fetchBooks();
        fetchReaders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    if (!checkIdIsNumber(id)) {
                        navigate('/admin/circulation/borrow');
                        return;
                    }

                    const response = await getBorrowReceiptById(id);
                    const { receiptNumber, borrowDate, dueDate, note, readerId, books } = response.data.data;
                    formik.setValues({
                        receiptNumber,
                        borrowDate: borrowDate ? dayjs(borrowDate) : null,
                        dueDate: dueDate ? dayjs(dueDate) : null,
                        note,
                        readerId,
                        books,
                    });

                    fetchSelectedBooks(books);
                } else {
                    const cartId = searchParams.get('cartId');
                    if (cartId) {
                        const response = await getBorrowReceiptByCartId(cartId);
                        const { readerId, books } = response.data.data;
                        formik.setValues({
                            ...formik.values,
                            readerId,
                            books,
                        });
                        fetchSelectedBooks(books);
                    }

                    const response = await generateReceiptNumber();
                    if (response.status === 200) {
                        formik.setFieldValue('receiptNumber', response.data.data);
                    }
                }
            } catch (error) {
                messageApi.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu phiếu mượn.');
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, searchParams]);

    const columns = [
        {
            title: 'Nhan đề',
            dataIndex: 'bookDefinition',
            key: 'title',
            render: ({ title }) => title,
        },
        {
            title: 'Số ĐKCB',
            dataIndex: 'bookCode',
            key: 'bookCode',
        },
        {
            title: 'Tác giả',
            dataIndex: 'bookDefinition',
            key: 'authors',
            render: ({ authors }) =>
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
            title: 'Loại sách',
            dataIndex: 'bookDefinition',
            key: 'category',
            render: ({ category }) => category?.name || 'N/A',
        },
        {
            title: 'Nhà xuất bản',
            dataIndex: 'bookDefinition',
            key: 'publisher',
            render: ({ publisher }) => publisher?.name || 'N/A',
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
                <Button
                    type="text"
                    danger
                    icon={<FaRegTrashAlt />}
                    onClick={() => handleDeleteColum(record.bookCode)}
                />
            ),
        },
    ];

    return (
        <div>
            {contextHolder}

            <h2>{id ? 'Sửa phiếu mượn' : 'Thêm phiếu mượn'}</h2>

            <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="selectedReader">
                            <span className="text-danger">*</span> Bạn đọc:
                        </label>
                        <Select
                            id="selectedReader"
                            showSearch
                            placeholder="Chọn bạn đọc"
                            filterOption={false}
                            onSearch={fetchReaders}
                            loading={isReadersLoading}
                            options={readers.map((reader) => ({
                                value: reader.id,
                                label: `${reader.cardNumber} - ${reader.fullName}`,
                            }))}
                            className="w-100"
                            value={formik.values.readerId}
                            onChange={(value) => formik.setFieldValue('readerId', value)}
                            onBlur={() => formik.setFieldTouched('readerId', true)}
                            status={formik.touched.readerId && formik.errors.readerId ? 'error' : undefined}
                        />
                        <div className="text-danger">{formik.touched.readerId && formik.errors.readerId}</div>
                    </div>

                    <FormInput
                        id="receiptNumber"
                        label="Số phiếu mượn"
                        className="col-md-6"
                        helperText="Số phiếu mượn nên nhập theo định dạng PM + số, ví dụ PM0001"
                        formik={formik}
                        required
                    />

                    <div className="col-md-6">
                        <label htmlFor="borrowDate">
                            <span className="text-danger">*</span> Ngày mượn:
                        </label>
                        <DatePicker
                            id="borrowDate"
                            name="borrowDate"
                            value={formik.values.borrowDate}
                            onChange={(date) => formik.setFieldValue('borrowDate', date)}
                            onBlur={() => formik.setFieldTouched('borrowDate', true)}
                            status={formik.touched.borrowDate && formik.errors.borrowDate ? 'error' : undefined}
                            className="w-100"
                        />
                        <div className="text-danger">{formik.touched.borrowDate && formik.errors.borrowDate}</div>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="dueDate">
                            <span className="text-danger">*</span> Ngày hẹn trả:
                        </label>
                        <DatePicker
                            id="dueDate"
                            name="dueDate"
                            value={formik.values.dueDate}
                            onChange={(date) => formik.setFieldValue('dueDate', date)}
                            onBlur={() => formik.setFieldTouched('dueDate', true)}
                            status={formik.touched.dueDate && formik.errors.dueDate ? 'error' : undefined}
                            className="w-100"
                        />
                        <div className="text-danger">{formik.touched.dueDate && formik.errors.dueDate}</div>
                    </div>

                    <FormTextArea id="note" label="Ghi chú" className="col-md-12" formik={formik} />

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
                                value: book.bookCode,
                            }))}
                            loading={isBooksLoading}
                            value={selectedBookCode}
                            onChange={(value) => setSelectedBookCode(value)}
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
                            rowKey="bookCode"
                            scroll={{ x: 'max-content' }}
                            columns={columns}
                            dataSource={selectedBooks}
                            pagination={false}
                        />
                        <div className="text-danger">{formik.touched.books && formik.errors.books}</div>
                    </div>

                    <div className="col-md-12 text-end">
                        <Space>
                            <Button onClick={() => navigate('/admin/circulation/borrow')}>Quay lại</Button>
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

export default BorrowBookForm;
