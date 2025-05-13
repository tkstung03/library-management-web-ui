import { useEffect, useState } from 'react';
import { Button, Input, Select, Space, Table } from 'antd';
import { Parallax } from 'react-parallax';
import { FaSearch } from 'react-icons/fa';
import queryString from 'query-string';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';
import { getBorrowReceiptsForReader } from '~/services/borrowReceiptService';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';

const options = [{ value: 'receiptNumber', label: 'Số phiếu' }];

function BorrowHistory() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

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

    const handleSearch = () => {
        setFilters((prev) => ({
            ...prev,
            pageNum: 1,
            searchBy: activeFilterOption,
            keyword: searchInput,
        }));
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBorrowReceiptsForReader(params);
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

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Lịch sử mượn trả ấn phẩm',
        },
    ];

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Mã phiếu',
            dataIndex: 'receiptNumber',
            key: 'receiptNumber',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Số sách',
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
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            sorter: true,
            showSorterTooltip: false,
            render: (note) => note || '-',
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
            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Lịch sử mượn trả</h1>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <Breadcrumb items={items} />
                            </div>
                        </div>
                    </div>
                </div>
            </Parallax>

            <div className="container sectionspace">
                <div className="row mb-4">
                    <SectionHeader title={<h2 className="mb-0">Lịch sử mượn trả ấn phẩm</h2>} subtitle="Lịch sử" />
                </div>
                <div className="row mb-4 justify-content-end align-items-center">
                    <div className="col-4">
                        <Space.Compact>
                            <Select
                                size="large"
                                options={options}
                                disabled={isLoading}
                                value={activeFilterOption}
                                onChange={(value) => setActiveFilterOption(value)}
                            />
                            <Input
                                size="large"
                                name="search"
                                placeholder="Nhập nhan số phiếu mượn, MCB..."
                                value={searchInput}
                                disabled={isLoading}
                                onChange={(e) => setSearchInput(e.target.value)}
                                addonAfter={
                                    <Button type="text" loading={isLoading} onClick={handleSearch}>
                                        <FaSearch />
                                    </Button>
                                }
                            />
                        </Space.Compact>
                    </div>
                </div>
                <div className="row mb-4 justify-content-between align-items-center">
                    <div className="col-4"></div>

                    <div className="col-4">
                        <div className="text-end">
                            <span> {isLoading ? '0 mục' : `${entityData.length} mục`}</span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
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
                </div>
            </div>
        </>
    );
}

export default BorrowHistory;
