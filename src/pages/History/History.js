import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { Button, DatePicker, Flex, Input, Select, Space, Table, Tag } from 'antd';
import { getLogs } from '~/services/logService';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';

const options = [
    { value: 'user', label: 'Người dùng' },
    { value: 'feature', label: 'Chức năng' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'content', label: 'Nội dung' },
];

const getTagByEvent = (event) => {
    switch (event) {
        case 'Thêm':
            return <Tag color="green">Thêm</Tag>;
        case 'Sửa':
            return <Tag color="yellow">Sửa</Tag>;
        case 'Xóa':
            return <Tag color="red">Xóa</Tag>;
        default:
            return <Tag color="default">{event}</Tag>;
    }
};

function History() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState({
        ...INITIAL_FILTERS,
        startDate: null,
        endDate: null,
    });

    const [entityData, setEntityData] = useState(null);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [activeFilterOption, setActiveFilterOption] = useState(options[0].value);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

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

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const params = queryString.stringify(filters);
                const response = await getLogs(params);
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
            title: 'Tài khoản',
            dataIndex: 'user',
            key: 'user',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Chức năng',
            dataIndex: 'feature',
            key: 'feature',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Sự kiện',
            dataIndex: 'event',
            key: 'event',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => getTagByEvent(text),
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            sorter: true,
            showSorterTooltip: false,
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
            <Flex justify="space-between" align="center">
                <h2>Nhật ký truy cập</h2>
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

export default History;
