import { useEffect, useState } from 'react';
import { Button, DatePicker, Flex, Input, message, Select, Space, Table } from 'antd';
import queryString from 'query-string';
import dayjs from 'dayjs';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { getBookBorrows } from '~/services/bookBorrowService';
import { bookBorrowReceiptMapping } from '~/common/borrowConstants';

const options = [
    { value: 'receiptNumber', label: 'Số phiếu mượn' },
    { value: 'cardNumber', label: 'Số thẻ bạn đọc' },
    { value: 'fullName', label: 'Tên bạn đọc' },
];

function ReturnHistory() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState({ ...INITIAL_FILTERS, status: ['RETURNED', 'LOST'] });

    const [entityData, setEntityData] = useState(null);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [activeFilterOption, setActiveFilterOption] = useState(options[0].value);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

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
            startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
            endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
        }));
    };

    const handleCancelReturn = async (bookId) => {
        // try {
        //     setIsLoading(true);
        //     const response = await returnBooks([bookId]);
        //     if (response.status === 200) {
        //         messageApi.success('Trả sách thành công!');
        //         handleChangePage(1);
        //     }
        // } catch (error) {
        //     messageApi.error(`Lỗi khi trả sách: ${error.response?.data?.message || error.message}`);
        // } finally {
        //     setIsLoading(false);
        // }
    };

    const handleDelete = async (bookId) => {
        // try {
        //     setIsLoading(true);
        //     const response = await reportLostBooks([bookId]);
        //     if (response.status === 200) {
        //         messageApi.success('Báo mất sách thành công!');
        //         handleChangePage(1);
        //     }
        // } catch (error) {
        //     messageApi.error(`Lỗi khi báo mất sách: ${error.response?.data?.message || error.message}`);
        // } finally {
        //     setIsLoading(false);
        // }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify({ ...filters, isReturn: true });
                const response = await getBookBorrows(params);
                const { meta, items } = response.data.data;
                setEntityData(items);
                setMeta(meta);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, [filters]);

    const columns = [
        {
            title: 'Mã cá biệt',
            dataIndex: 'bookCode',
            key: 'bookCode',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Nhan đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Số phiếu mượn',
            dataIndex: 'receiptNumber',
            key: 'receiptNumber',
        },
        {
            title: 'Số thẻ',
            dataIndex: 'cardNumber',
            key: 'cardNumber',
        },
        {
            title: 'Tên bạn đọc',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: true,
            showSorterTooltip: false,
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
            title: 'Ngày trả',
            dataIndex: 'returnDate',
            key: 'returnDate',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Quá hạn',
            dataIndex: 'overdueDays',
            key: 'overdueDays',
            render: (_, record) => {
                if (!record.returnDate) {
                    return '';
                }

                const dueDate = dayjs(record.dueDate);
                const returnDate = dayjs(record.returnDate);

                const overdueDays = Math.max(0, returnDate.diff(dueDate, 'day'));
                return `${overdueDays} ngày`;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            showSorterTooltip: false,
            render: (status) => bookBorrowReceiptMapping[status],
        },
        // {
        //     title: '',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Space>
        //             <Button type="link" onClick={() => handleCancelReturn(record.id)}>
        //                 Hủy trả
        //             </Button>
        //             <Button type="link" onClick={() => handleDelete(record.id)} danger>
        //                 Xóa
        //             </Button>
        //         </Space>
        //     ),
        // },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
        },
    };

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

            <Flex wrap justify="space-between" align="center">
                <h2>Lịch sử trả sách</h2>

                <Space>
                    <DatePicker
                        name="startDate"
                        placeholder="Ngày bắt đầu"
                        value={startDate}
                        onChange={(date) => {
                            setStartDate(date);
                        }}
                        disabled={isLoading}
                    />
                    <DatePicker
                        name="endDate"
                        placeholder="Ngày kết thúc"
                        value={endDate}
                        onChange={(date) => {
                            setEndDate(date);
                        }}
                        disabled={isLoading}
                    />

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
                </Space>
            </Flex>

            <Table
                bordered
                rowKey="id"
                scroll={{ x: 'max-content' }}
                dataSource={entityData}
                columns={columns}
                rowSelection={rowSelection}
                loading={isLoading}
                onChange={handleSortChange}
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

export default ReturnHistory;
