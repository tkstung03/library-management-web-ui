import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Drawer, Dropdown, Flex, Input, Menu, message, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt, FaPrint } from 'react-icons/fa';
import { GrPrint } from 'react-icons/gr';
import { IoIosMore } from 'react-icons/io';
import { CiExport } from 'react-icons/ci';
import { MdOutlineCancel } from 'react-icons/md';
import queryString from 'query-string';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import {
    cancelReturn,
    deleteBorrowReceipt,
    exportBorrowReceipts,
    getBorrowReceiptDetails,
    getBorrowReceipts,
    printBorrowReceipts,
} from '~/services/borrowReceiptService';
import { bookBorrowReceiptMapping } from '~/common/borrowConstants';

const options = [
    { value: 'receiptNumber', label: 'Số phiếu mượn' },
    { value: 'cardNumber', label: 'Số thẻ bạn đọc' },
    { value: 'fullName', label: 'Tên bạn đọc' },
];

const borrowReceiptMapping = {
    NOT_RETURNED: <Tag color="orange">Chưa trả</Tag>,
    RETURNED: <Tag color="green">Đã trả</Tag>,
    PARTIALLY_RETURNED: <Tag color="gold">Chưa trả đủ</Tag>,
    OVERDUE: <Tag color="red">Quá hạn</Tag>,
};

const mapTypeToStatus = {
    1: 'NOT_RETURNED',
    2: 'RETURNED',
    3: 'PARTIALLY_RETURNED',
    4: 'OVERDUE',
};

function BorrowBook() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [activeFilterOption, setActiveFilterOption] = useState(options[0].value);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const handleChangePage = (newPage) => {
        setFilters((prev) => ({ ...prev, pageNum: newPage }));
    };

    const handleChangeRowsPerPage = (current, size) => {
        setFilters((prev) => ({
            ...prev,
            pageNum: 1,
            pageSize: size,
        }));
    };

    const handleSortChange = (pagination, filters, sorter) => {
        const sortOrder = sorter.order === 'ascend' ? true : sorter.order === 'descend' ? false : undefined;
        setFilters((prev) => ({
            ...prev,
            sortBy: sorter.field,
            isAscending: sortOrder,
        }));
    };

    const handleSearch = (searchBy, keyword) => {
        setFilters((prev) => ({
            ...prev,
            pageNum: 1,
            searchBy: searchBy || activeFilterOption,
            keyword: keyword || searchInput,
        }));
    };

    const showDrawer = async (receiptId) => {
        setLoadingDetails(true);
        setIsDrawerOpen(true);

        try {
            const response = await getBorrowReceiptDetails(receiptId);
            setReceiptDetails(response.data.data);
        } catch (error) {
            message.error('Không thể tải chi tiết phiếu mượn.');
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setReceiptDetails(null);
    };

    const handleDeleteEntity = async (id) => {
        try {
            const response = await deleteBorrowReceipt(id);
            if (response.status === 200) {
                setEntityData((prev) => prev.filter((a) => a.id !== id));

                messageApi.success(response.data.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa.';
            messageApi.error(errorMessage);
        }
    };

    const handlePrintBorrow = async () => {
        setIsLoading(true);
        try {
            const response = await printBorrowReceipts({
                schoolName: 'Trường Đại học Công nghiệp Hà Nội',
                borrowIds: selectedRowKeys,
            });

            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất dữ liệu.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintBlankTemplate = async () => {
        setIsLoading(true);
        try {
            const response = await printBorrowReceipts({
                schoolName: 'Trường Đại học Công nghiệp Hà Nội',
                borrowIds: [],
            });

            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất dữ liệu.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintOverdueList = async () => {
        setIsLoading(true);
        try {
            const response = await printBorrowReceipts({
                schoolName: 'Trường Đại học Công nghiệp Hà Nội',
                overdueOnly: true,
            });

            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất dữ liệu.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelReturn = async () => {
        setIsLoading(true);
        try {
            const response = await cancelReturn(selectedRowKeys);
            if (response.status === 200) {
                messageApi.success(response.data.data.message);
                handleChangePage(1);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportReturnData = async () => {
        setIsLoading(true);
        try {
            const response = await exportBorrowReceipts();
            if (response.status === 200) {
                const fileBlob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                const fileURL = URL.createObjectURL(fileBlob);

                const a = document.createElement('a');
                a.href = fileURL;
                a.download = 'export_borrow_receipts.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                URL.revokeObjectURL(fileURL);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất dữ liệu.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBorrowReceipts(params);
                const { meta, items } = response.data.data;
                setEntityData(items);
                setMeta(meta);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        const type = searchParams.get('type');

        const updatedFilters = {
            ...filters,
            status: mapTypeToStatus[type],
        };

        if (JSON.stringify(filters) !== JSON.stringify(updatedFilters)) {
            setFilters(updatedFilters);
        } else {
            fetchEntities();
        }
    }, [filters, searchParams]);

    const rowSelection = {
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
        },
        getCheckboxProps: (record, index) => ({
            name: record.id,
        }),
    };

    const columns = [
        {
            title: 'Số phiếu mượn',
            dataIndex: 'receiptNumber',
            key: 'receiptNumber',
            sorter: true,
            showSorterTooltip: false,
            render: (text, record) => (
                <Space>
                    <span style={{ color: '#0997eb', cursor: 'pointer' }} onClick={() => showDrawer(record.id)}>
                        {text}
                    </span>

                    <Link
                        to="/admin/circulation/return-renew"
                        state={{ searchBy: 'receiptNumber', keyword: record.receiptNumber }}
                    >
                        Trả sách
                    </Link>
                </Space>
            ),
        },
        {
            title: 'Số thẻ bạn đọc',
            dataIndex: 'cardNumber',
            key: 'cardNumber',
        },
        {
            title: 'Tên bạn đọc',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Số lượng mượn',
            dataIndex: 'books',
            key: 'books',
        },
        {
            title: 'Ngày mượn',
            dataIndex: 'borrowDate',
            key: 'borrowDate',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Ngày hẹn trả',
            dataIndex: 'dueDate',
            key: 'dueDate',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            showSorterTooltip: false,
            align: 'center',
            render: (status) => borrowReceiptMapping[status],
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<MdOutlineModeEdit />} onClick={() => navigate(`edit/${record.id}`)} />
                    <Popconfirm
                        title="Xóa phiếu mượn"
                        description="Bạn có chắc muốn xóa phiếu mượn này không?"
                        onConfirm={() => handleDeleteEntity(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<FaRegTrashAlt />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const printActions = [
        {
            key: '1',
            icon: <GrPrint />,
            label: 'Phiếu mượn',
            disabled: selectedRowKeys.length === 0,
            onClick: handlePrintBorrow,
        },
        {
            key: '2',
            icon: <GrPrint />,
            label: 'Phiếu mượn tài liệu mẫu trắng',
            onClick: handlePrintBlankTemplate,
        },
        {
            key: '3',
            icon: <GrPrint />,
            label: 'Danh sách mượn quá hạn chưa trả',
            onClick: handlePrintOverdueList,
        },
    ];

    const returnActions = [
        {
            key: '1',
            icon: <MdOutlineCancel />,
            label: 'Hủy trả',
            disabled: selectedRowKeys.length === 0,
            onClick: handleCancelReturn,
        },
        {
            key: '2',
            icon: <CiExport />,
            label: 'Xuất file',
            onClick: handleExportReturnData,
        },
    ];

    const navItems = [
        {
            key: 'ALL',
            label: <Link to="/admin/circulation/borrow">Tất cả</Link>,
        },
        {
            key: 'NOT_RETURNED',
            label: <Link to="?type=1">Chưa trả</Link>,
        },
        {
            key: 'RETURNED',
            label: <Link to="?type=2">Đã trả</Link>,
        },
        {
            key: 'PARTIALLY_RETURNED',
            label: <Link to="?type=3">Chưa trả đủ</Link>,
        },
        {
            key: 'OVERDUE',
            label: <Link to="?type=4">Quá hạn</Link>,
        },
    ];

    if (errorMessage) {
        return (
            <div className="alert alert-danger p-2" role="alert">
                Lỗi: {errorMessage}
            </div>
        );
    }

    return (
        <div>
            {contextHolder}

            <Drawer title="Chi tiết phiếu mượn" width={720} onClose={closeDrawer} open={isDrawerOpen}>
                {loadingDetails ? (
                    <div>Đang tải...</div>
                ) : receiptDetails ? (
                    <div className="container">
                        <div className="row mb-4">
                            <h4> Phiếu mượn sách {receiptDetails.receiptNumber}</h4>
                        </div>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="fw-bold">Bạn đọc:</div>
                                <p>{receiptDetails.fullName}</p>
                            </div>
                            <div className="col-md-6">
                                <div className="fw-bold">Ngày mượn:</div>
                                <p>{receiptDetails.borrowDate}</p>
                            </div>
                            <div className="col-md-6">
                                <div className="fw-bold">Ngày hẹn trả:</div>
                                <p>{receiptDetails.dueDate}</p>
                            </div>
                            <div className="col-md-6">
                                <div className="fw-bold">Tình trạng:</div>
                                {borrowReceiptMapping[receiptDetails.status]}
                            </div>
                        </div>

                        <div className="row">
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Nhan đề</th>
                                        <th>Số đăng ký cá biệt</th>
                                        <th>Ngày trả</th>
                                        <th>Tình trạng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receiptDetails.books.map((book, index) => (
                                        <tr key={index}>
                                            <td>{book.title}</td>
                                            <td>{book.bookCode}</td>
                                            <td>{book.returnDate}</td>
                                            <td>{bookBorrowReceiptMapping[book.status]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="4" className="text-end fw-bold">
                                            Tổng: {receiptDetails.books.length} đầu sách
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div>Không có dữ liệu.</div>
                )}
            </Drawer>

            <h2>Mượn sách</h2>

            <Flex wrap justify="space-between" align="center">
                <Menu mode="horizontal" selectedKeys={[filters.status || 'ALL']} items={navItems} />
                <Space>
                    <Space.Compact className="my-2">
                        <Select
                            options={options}
                            disabled={isLoading}
                            value={activeFilterOption}
                            onChange={(value) => setActiveFilterOption(value)}
                        />
                        <Input
                            allowClear
                            name="searchInput"
                            placeholder="Nhập từ cần tìm..."
                            value={searchInput}
                            disabled={isLoading}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <Button type="primary" loading={isLoading} onClick={() => handleSearch()}>
                            Tìm
                        </Button>
                    </Space.Compact>

                    <Button type="primary" onClick={() => navigate('new')}>
                        Lập phiếu mượn
                    </Button>

                    <Dropdown menu={{ items: printActions }}>
                        <Button icon={<FaPrint />}>In</Button>
                    </Dropdown>

                    <Dropdown menu={{ items: returnActions }}>
                        <Button icon={<IoIosMore />}></Button>
                    </Dropdown>
                </Space>
            </Flex>

            <br />

            <Table
                bordered
                rowKey="id"
                scroll={{ x: 'max-content' }}
                dataSource={entityData}
                columns={columns}
                loading={isLoading}
                onChange={handleSortChange}
                rowSelection={rowSelection}
                pagination={{
                    current: filters.pageNum,
                    pageSize: filters.pageSize,
                    total: meta.totalElements,
                    onChange: handleChangePage,
                    showSizeChanger: true,
                    onShowSizeChange: handleChangeRowsPerPage,
                }}
            />
        </div>
    );
}

export default BorrowBook;
