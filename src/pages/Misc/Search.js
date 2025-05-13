import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { Parallax } from 'react-parallax';
import { Collapse, Pagination, Tabs } from 'antd';
import { backgrounds } from '~/assets';
import Product from '~/components/Product';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';
import BasicSearchForm from '~/components/BasicSearchForm';
import AdvancedSearchForm from '~/components/AdvancedSearchForm';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { advancedSearchBooks, searchBooks } from '~/services/bookDefinitionService';
import { useLocation } from 'react-router-dom';
import { getLibraryInfoStats } from '~/services/statisticsService';

function Search() {
    const location = useLocation();

    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [publications, setPublications] = useState(0);
    const [entityData, setEntityData] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [searchParams, setSearchParams] = useState(null);

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

    const handleSearch = async (query) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const params = queryString.stringify(filters);
            let response;
            if (activeTabKey === '1') {
                response = await searchBooks(params, query);
            } else {
                response = await advancedSearchBooks(params, query);
            }
            const { meta, items } = response.data.data;
            setEntityData(items);
            setMeta(meta);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const params = queryString.parse(location.search);
        if (params.type || params.value) {
            setSearchParams({
                type: params.type,
                value: params.value,
            });
        }
        if (params.tab && (params.tab === '1' || params.tab === '2')) {
            setActiveTabKey(params.tab);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    useEffect(() => {
        const fetchLibraryInfo = async () => {
            try {
                const response = await getLibraryInfoStats();
                const { publications } = response.data.data;
                setPublications(publications);
            } catch (error) {}
        };

        fetchLibraryInfo();
    }, []);

    const breadcrumbItems = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Tìm kiếm nâng cao',
        },
    ];

    const searchTabs = [
        {
            key: '1',
            label: 'Cơ bản',
            children: <BasicSearchForm onSearch={handleSearch} init={searchParams} />,
        },
        {
            key: '2',
            label: 'Nâng cao',
            children: <AdvancedSearchForm onSearch={handleSearch} />,
        },
    ];

    const collapseItems = [
        {
            key: '1',
            label: 'Tổng số ấn phẩm',
            children: publications,
        },
        {
            key: '2',
            label: 'Huớng dẫn tra cứu',
            children: (
                <ul>
                    <li>
                        <strong>Tìm cơ bản:</strong>
                        Tìm theo Loại tài liệu, Từ khóa, Tên tài liệu, Tác giả, Năm xuất bản
                    </li>
                    <li>
                        <strong>Tìm nâng cao:</strong>
                        Tìm theo theo toán tử AND, OR, NOT
                    </li>
                </ul>
            ),
        },
    ];

    return (
        <>
            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Tìm kiếm nâng cao</h1>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <Breadcrumb items={breadcrumbItems} />
                            </div>
                        </div>
                    </div>
                </div>
            </Parallax>

            <div className="container sectionspace">
                <div className="row mb-4">
                    <div className="col-3">
                        <Collapse items={collapseItems} defaultActiveKey={['1']} />
                    </div>
                    <div className="col-9">
                        <SectionHeader title={<h2 className="mb-0">Tìm kiếm sách</h2>} subtitle="Tìm kiếm" />
                        <Tabs
                            className="mt-4"
                            defaultActiveKey="1"
                            size="large"
                            items={searchTabs}
                            activeKey={activeTabKey}
                            onChange={setActiveTabKey}
                        />
                    </div>
                </div>

                <div className="row mb-4">
                    <SectionHeader title={<h2 className="mb-0">Thư viện sách</h2>} subtitle="Tìm kiếm sách" />
                </div>

                <div className="row mb-4">
                    {isLoading ? (
                        <>Đang tải...</>
                    ) : errorMessage ? (
                        <div className="alert alert-danger">{errorMessage}</div>
                    ) : (
                        <>
                            {entityData.length > 0 ? (
                                entityData.map((entity, index) => (
                                    <Product key={index} className={'col-2 mx-2 my-1'} data={entity} />
                                ))
                            ) : (
                                <div className="alert alert-info">
                                    Không tìm thấy kết quả nào phù hợp với tìm kiếm của bạn.
                                </div>
                            )}
                        </>
                    )}
                </div>
                {entityData && (
                    <div className="row justify-content-end">
                        <div className="col-auto">
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
                )}
            </div>
        </>
    );
}

export default Search;
