import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import queryString from 'query-string';
import dayjs from 'dayjs';
import { Button, Input, Space, Table } from 'antd';
import { Parallax } from 'react-parallax';
import { FaSearch } from 'react-icons/fa';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';
import { getCartDetails, removeFromCart } from '~/services/cartService';

function BorrowedItems() {
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState({});

    const [entityData, setEntityData] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleDelete = async () => {
        try {
            const response = await removeFromCart(selectedRowKeys);
            if (response.status === 200) {
                setEntityData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)));
                setSelectedRowKeys([]);
            }
        } catch (error) {}
    };

    const handleSearch = () => {
        setFilters((prev) => ({
            ...prev,
            title: searchInput,
        }));
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getCartDetails(params);
                const { data } = response.data;
                setEntityData(data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        const type = searchParams.get('type');

        const updatedFilters = {
            ...filters,
            type: type,
        };

        if (JSON.stringify(filters) !== JSON.stringify(updatedFilters)) {
            setFilters(updatedFilters);
        } else {
            fetchEntities();
        }
    }, [filters, searchParams]);

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Thông tin ấn phẩm được đăng ký mượn',
        },
    ];

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
            align: 'center',
        },
        {
            title: 'Mã ĐKCB',
            dataIndex: 'bookCode',
            key: 'bookCode',
        },
        {
            title: 'Nhan đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Tên tác giả',
            dataIndex: 'authors',
            key: 'authors',
            render: (authors) =>
                authors.length > 0
                    ? authors.map((author, index) => (
                          <React.Fragment key={author.id || index}>
                              <Link to={`/books?authorId=${author.id}`}>{author.name}</Link>
                              {index < authors.length - 1 && ', '}
                          </React.Fragment>
                      ))
                    : 'Không xác định',
        },
        {
            title: 'Đăng ký mượn từ',
            dataIndex: 'borrowFrom',
            key: 'borrowFrom',
        },
        {
            title: 'Đến',
            dataIndex: 'borrowTo',
            key: 'borrowTo',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const isOverdue = dayjs(record.borrowTo).isBefore(dayjs());
                return (
                    <span style={{ color: isOverdue ? 'red' : 'green' }}>
                        {isOverdue ? 'Hết thời gian chờ' : 'Đang chờ xử lý'}
                    </span>
                );
            },
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
                                <h1>Đăng ký mượn ấn phẩm</h1>
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
                    <SectionHeader
                        title={<h2 className="mb-0">Thông tin ấn phẩm được đăng ký</h2>}
                        subtitle="Thông tin mượn"
                    />
                </div>
                <div className="row mb-4 justify-content-end align-items-center">
                    <div className="col-4">
                        <Input
                            size="large"
                            name="search"
                            placeholder="Nhập nhan đề ..."
                            value={searchInput}
                            disabled={isLoading}
                            onChange={(e) => setSearchInput(e.target.value)}
                            addonAfter={
                                <Button type="text" loading={isLoading} onClick={() => handleSearch()}>
                                    <FaSearch />
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div className="row mb-4 justify-content-between align-items-center">
                    <div className="col-4">
                        <Space>
                            <Link to="?type=1" className="text-success">
                                Chưa xử lý
                            </Link>
                            <span> | </span>
                            <Link to="?type=2" className="text-danger">
                                Quá hạn
                            </Link>
                            <Button type="default" onClick={handleDelete} disabled={!selectedRowKeys.length}>
                                Xóa
                            </Button>
                        </Space>
                    </div>

                    <div className="col-4">
                        <div className="text-end">
                            <span>1 mục</span>
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
                            rowSelection={rowSelection}
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default BorrowedItems;
