import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, message, Pagination, Select, Spin } from 'antd';
import queryString from 'query-string';
import { Parallax } from 'react-parallax';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import Product from '~/components/Product';
import SectionHeader from '~/components/SectionHeader';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { getBookByBookDefinitionsForUser } from '~/services/bookDefinitionService';

const options = [
    { value: 'title', label: 'Tên sách' },
    { value: 'bookCode', label: 'Kí hiệu' },
];

function BookCollection() {
    const [searchParams] = useSearchParams();

    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

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

    const handleSortChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            pageNum: 1,
            sortBy: value,
            isAscending: !prev.isAscending,
        }));
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBookByBookDefinitionsForUser(params);
                const { meta, items } = response.data.data;
                setEntityData(items);
                setMeta(meta);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        const authorId = searchParams.get('authorId');
        const categoryGroupId = searchParams.get('categoryGroupId');
        const categoryId = searchParams.get('categoryId');

        const updatedFilters = {
            ...filters,
            authorId: authorId || filters.authorId || null,
            categoryGroupId: categoryGroupId || filters.categoryGroupId || null,
            categoryId: categoryId || filters.categoryId || null,
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
            label: 'Thư viện sách',
            url: '/books',
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
            {contextHolder}

            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Thư viện sách</h1>
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
                <div className="row">
                    <div className="col-12 col-md-3">
                        <Button block>Sách được mượn nhiều nhất</Button>
                    </div>

                    <div className="col-12 col-md-9">
                        <div className="row mb-4">
                            <div className="col-12">
                                <SectionHeader
                                    title={<h2 className="mb-0">Thư viện sách</h2>}
                                    subtitle="Mọi người đều chọn"
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-12 d-flex justify-content-end">
                                <Select
                                    options={options}
                                    disabled={isLoading}
                                    value={filters.sortBy}
                                    onChange={handleSortChange}
                                    style={{ width: 200 }}
                                    placeholder="Lọc danh sách theo"
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            {isLoading ? (
                                <Spin />
                            ) : entityData.length > 0 ? (
                                entityData.map((data, index) => (
                                    <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <Product data={data} messageApi={messageApi} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <p>Không có sách để hiển thị.</p>
                                </div>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-12 d-flex justify-content-center">
                                <Pagination
                                    current={filters.pageNum}
                                    pageSize={filters.pageSize}
                                    total={meta.totalElements}
                                    onChange={handleChangePage}
                                    showSizeChanger={true}
                                    onShowSizeChange={handleChangeRowsPerPage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookCollection;
