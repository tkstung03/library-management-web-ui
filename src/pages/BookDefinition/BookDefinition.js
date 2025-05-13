import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Flex, Input, message, Popconfirm, Select, Space, Switch, Table } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import { RiFileCopyLine } from 'react-icons/ri';

import queryString from 'query-string';

import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { deleteBookDefinition, getBookDefinitions, toggleActiveFlag } from '~/services/bookDefinitionService';

const options = [
    { value: 'title', label: 'Nhan đề' },
    { value: 'bookCode', label: 'Kí hiệu' },
];

function BookDefinition() {
    const navigate = useNavigate();

    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [activeFilterOption, setActiveFilterOption] = useState(options[0].value);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

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
        }));
    };

    const handleDeleteEntity = async (id) => {
        try {
            const response = await deleteBookDefinition(id);
            if (response.status === 200) {
                setEntityData((prev) => prev.filter((a) => a.id !== id));

                messageApi.success(response.data.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa.';
            messageApi.error(errorMessage);
        }
    };

    const handleToggleActiveFlag = async (checked, record) => {
        try {
            const response = await toggleActiveFlag(record.id);
            if (response.status === 200) {
                const { data, message } = response.data.data;
                setEntityData((prevData) =>
                    prevData.map((item) => (item.id === record.id ? { ...item, activeFlag: data } : item)),
                );
                messageApi.success(message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.';
            messageApi.error(errorMessage);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBookDefinitions(params);
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
            title: 'Nhan đề',
            dataIndex: 'title',
            key: 'title',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Tác giả',
            dataIndex: 'authors',
            key: 'authors',
            sorter: true,
            showSorterTooltip: false,
            render: (authors) => authors.map((author) => author.name).join(', '),
        },
        {
            title: 'Giá bìa',
            dataIndex: 'price',
            key: 'price',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Mã ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Nhà xuất bản',
            dataIndex: 'publisher',
            key: 'publisher',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => (text ? <Link to="/admin/publishers">{text.name}</Link> : 'Chưa có'),
        },
        {
            title: 'Năm xuất bản',
            dataIndex: 'publishingYear',
            key: 'publishingYear',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'activeFlag',
            key: 'activeFlag',
            render: (text, record) => (
                <Space>
                    {text ? 'Đang theo dõi' : 'Ngừng theo dõi'}
                    <Switch checked={text} onChange={(checked) => handleToggleActiveFlag(checked, record)} />
                </Space>
            ),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<MdOutlineModeEdit />} onClick={() => navigate(`edit/${record.id}`)} />
                    <Button type="text" icon={<RiFileCopyLine />} onClick={() => navigate(`copy/${record.id}`)} />
                    <Popconfirm
                        title="Xóa biên mục"
                        description="Bạn có chắc muốn xóa biên mục này không?"
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
                <h2>Biên mục</h2>
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
                        Thêm mới
                    </Button>
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

export default BookDefinition;
