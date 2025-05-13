import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Select, Space, Table, Tree } from 'antd';
import { FaPrint } from 'react-icons/fa';
import { GrPrint } from 'react-icons/gr';
import queryString from 'query-string';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { getBookByBookDefinitions } from '~/services/bookDefinitionService';
import { getCategoryGroupsTree } from '~/services/categoryGroupService';
import {
    getBookLabelType1Pdf,
    getBookLabelType2Pdf,
    getBookListPdf,
    getBookPdf,
} from '~/services/bookDefinitionService';

const options = [
    { value: 'title', label: 'Nhan đề' },
    { value: 'bookCode', label: 'Kí hiệu tên sách' },
];

function BookListByCategory() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
        }));
    };

    const onSelectTree = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            const selectedKey = selectedKeys[0];

            if (selectedKey.startsWith('group-')) {
                const selectedCategoryGroupId = selectedKey.split('-')[1];
                if (selectedCategoryGroupId > 0) {
                    setFilters((prev) => ({
                        ...prev,
                        pageNum: 1,
                        categoryGroupId: selectedCategoryGroupId,
                        categoryId: null,
                    }));
                } else {
                    setFilters((prev) => ({
                        ...prev,
                        pageNum: 1,
                        categoryGroupId: null,
                        categoryId: null,
                    }));
                }
            } else if (selectedKey.startsWith('category-')) {
                const selectedCategoryId = selectedKey.split('-')[1];
                setFilters((prev) => ({
                    ...prev,
                    pageNum: 1,
                    categoryId: selectedCategoryId,
                    categoryGroupId: null,
                }));
            }
        }
    };

    const transformToTreeData = (data) => {
        return data.map((group) => ({
            title: (
                <>
                    {group.name} <b>({group.count})</b>
                </>
            ),
            key: `group-${group.id}`,
            children: group.categories.map((category) => ({
                title: (
                    <>
                        {category.name} <b>({category.count})</b>
                    </>
                ),
                key: `category-${category.id}`,
            })),
        }));
    };

    const openBookPdf = async () => {
        try {
            const response = await getBookPdf(selectedRowKeys);
            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error getting book PDF:', error);
        }
    };

    const openBookLabelType1Pdf = async () => {
        try {
            const response = await getBookLabelType1Pdf(selectedRowKeys);
            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error getting book label type 1 PDF:', error);
        }
    };

    const openBookLabelType2Pdf = async () => {
        try {
            const response = await getBookLabelType2Pdf(selectedRowKeys);
            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error getting book label type 2 PDF:', error);
        }
    };

    const openBookListPdf = async () => {
        try {
            const response = await getBookListPdf();
            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open(url, '_blank');
                newTab.focus();

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error getting book list PDF:', error);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBookByBookDefinitions(params);
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

    useEffect(() => {
        const fetchTreeData = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getCategoryGroupsTree();
                const transformedTreeData = transformToTreeData(response.data.data);
                setTreeData(transformedTreeData);

                const allKeys = transformedTreeData.flatMap((group) => {
                    const groupKey = group.key;
                    const categoryKeys = group.children ? group.children.map((child) => child.key) : [];
                    return [groupKey, ...categoryKeys];
                });
                setExpandedKeys(allKeys);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreeData();
    }, []);

    const columns = [
        {
            title: 'Nhan đề',
            dataIndex: 'title',
            key: 'title',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'KHPL',
            dataIndex: 'classificationSymbol',
            key: 'classificationSymbol',
            sorter: true,
            showSorterTooltip: false,
            render: (text, record) => <>{text ? text.name : ''}</>,
        },
        {
            title: 'Tác giả',
            dataIndex: 'authors',
            key: 'authors',
            sorter: true,
            showSorterTooltip: false,
            render: (text, record) => (
                <span>
                    {text.map((author, index) => (
                        <span key={author.id}>
                            {author.name}
                            {index < text.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </span>
            ),
        },
        {
            title: 'Nhà xuất bản',
            dataIndex: 'publisher',
            key: 'publisher',
            sorter: true,
            showSorterTooltip: false,
            render: (text, record) => <span>{text ? text.name : 'Không có'}</span>,
        },
        {
            title: 'Năm xuất bản',
            dataIndex: 'publishingYear',
            key: 'publishingYear',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Tổng số bản',
            dataIndex: 'totalBooks',
            key: 'totalBooks',
        },
        {
            title: 'Còn',
            children: [
                {
                    title: 'Trong thư viện',
                    dataIndex: 'availableBooks',
                    key: 'availableBooks',
                    align: 'center',
                    width: 100,
                },
                {
                    title: 'Đang cho mượn',
                    dataIndex: 'borrowedBooks',
                    key: 'borrowedBooks',
                    align: 'center',
                    width: 100,
                },
            ],
        },
        {
            title: 'Đã mất',
            dataIndex: 'lostBooks',
            key: 'lostBooks',
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
        },
        getCheckboxProps: (record, index) => ({
            name: record.id,
        }),
    };

    const items = [
        {
            key: '1',
            icon: <GrPrint />,
            label: 'Phích chuẩn ISBD',
            disabled: selectedRowKeys.length === 0,
            onClick: openBookPdf,
        },
        {
            key: '2',
            icon: <GrPrint />,
            label: 'Dán bìa, gáy - dọc A4',
            disabled: selectedRowKeys.length === 0,
            onClick: openBookLabelType1Pdf,
        },
        {
            key: '3',
            icon: <GrPrint />,
            label: 'Nhãn dán từ gáy đến bìa A4',
            disabled: selectedRowKeys.length === 0,
            onClick: openBookLabelType2Pdf,
        },
        {
            key: '4',
            icon: <GrPrint />,
            label: 'Danh mục sách',
            disabled: selectedRowKeys.length === 0,
            onClick: openBookListPdf,
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
        <>
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

                <Dropdown menu={{ items }}>
                    <Button type="primary" icon={<FaPrint />}>
                        In
                    </Button>
                </Dropdown>
            </Space>

            <div className="row">
                <div className="col-md-2">
                    <Tree
                        treeData={treeData}
                        expandedKeys={expandedKeys}
                        onExpand={setExpandedKeys}
                        onSelect={onSelectTree}
                    />
                </div>
                <div className="col-md-10">
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
            </div>
        </>
    );
}

export default BookListByCategory;
