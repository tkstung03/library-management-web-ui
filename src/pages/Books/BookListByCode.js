import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Select, Space, Table } from 'antd';
import { FaPrint } from 'react-icons/fa';
import { GrPrint } from 'react-icons/gr';
import queryString from 'query-string';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import {
    getBooks,
    getBookLabelType1Pdf,
    getBookLabelType2Pdf,
    getBookListPdf,
    getBookPdf,
} from '~/services/bookService';

const options = [
    { value: 'bookCode', label: 'Số ĐKCB' },
    { value: 'title', label: 'Nhan đề' },
];

const bookConditionMapping = {
    AVAILABLE: 'Sách có sẵn',
    ON_LOAN: 'Sách đang mượn',
    LOST: 'Sách bị mất',
};

const bookStatusMapping = {
    USABLE: 'Sử dụng được',
    DAMAGED: 'Rách nát',
    OUTDATED: 'Lạc hậu',
    INFESTED: 'Mối mọt',
    OBSOLETE_PROGRAM: 'Chương trình cũ',
};

function BookListByCode() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

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
                const response = await getBooks(params);
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
            title: 'Số ĐKCB',
            dataIndex: 'bookCode',
            key: 'bookCode',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Nhan đề',
            dataIndex: 'bookDefinition',
            key: 'title',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => <span>{text.title}</span>,
        },
        {
            title: 'KHPL',
            dataIndex: 'bookDefinition',
            key: 'classificationSymbol',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => <span>{text.classificationSymbol ? text.classificationSymbol.name : ''}</span>,
        },
        {
            title: 'Tác giả',
            dataIndex: 'bookDefinition',
            key: 'authors',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => (
                <span>
                    {text.authors.map((author, index) => (
                        <span key={author.id}>
                            {author.name}
                            {index < text.authors.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </span>
            ),
        },
        {
            title: 'Nhà xuất bản',
            dataIndex: 'bookDefinition',
            key: 'publisher',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => <span>{text.publisher ? text.publisher.name : 'Không có'}</span>,
        },
        {
            title: 'Năm xuất bản',
            dataIndex: 'bookDefinition',
            key: 'publishingYear',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => text.publishingYear,
        },
        {
            title: 'Trạng thái sách',
            dataIndex: 'bookStatus',
            key: 'bookStatus',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => bookStatusMapping[text] || '',
        },
        {
            title: 'Tình trạng sách',
            dataIndex: 'bookCondition',
            key: 'bookCondition',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => bookConditionMapping[text] || '',
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
        </>
    );
}

export default BookListByCode;
