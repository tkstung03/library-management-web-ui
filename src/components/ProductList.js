import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation } from 'swiper/modules';

import Product from './Product';
import SectionHeader from './SectionHeader';

import classNames from 'classnames/bind';
import styles from '~/styles/ProductList.module.scss';
import { getBookByBookDefinitionsForUser } from '~/services/bookDefinitionService';
import queryString from 'query-string';

const cx = classNames.bind(styles);

function ProductList({ filters, title, subtitle, messageApi }) {
    const navigate = useNavigate();

    const [entityData, setEntityData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleViewAll = () => {
        navigate('/books');
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBookByBookDefinitionsForUser(params);
                const { items } = response.data.data;
                setEntityData(items);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, [filters]);

    return (
        <section className={cx('wrapper', 'sectionspace')}>
            <div className="container">
                <div className="row mb-3">
                    <div className="col-12">
                        <SectionHeader
                            subtitle={subtitle}
                            title={title}
                            onViewAll={handleViewAll}
                            // Bạn có thể điều chỉnh các nút điều hướng thủ công nếu cần
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        {isLoading ? (
                            <>Loading</>
                        ) : errorMessage ? (
                            <>{errorMessage}</>
                        ) : (
                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={20}
                                slidesPerView={5}
                                autoplay={{
                                    delay: 2500,
                                    disableOnInteraction: false,
                                }}
                                navigation
                                grabCursor
                                className={cx('swiper-container')}
                            >
                                {entityData.map((data, index) => (
                                    <SwiperSlide key={index}>
                                        <Product className="mx-2 my-1" data={data} messageApi={messageApi} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductList;
