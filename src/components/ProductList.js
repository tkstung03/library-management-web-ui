import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import { Navigation } from 'swiper/modules';

import Product from './Product';
import SectionHeader from './SectionHeader';

import classNames from 'classnames/bind';
import styles from '~/styles/ProductList.module.scss';
import { getBookByBookDefinitionsForUser } from '~/services/bookDefinitionService';
import queryString from 'query-string';

const cx = classNames.bind(styles);

function ProductList({ filters, title, subtitle, messageApi, currentBookId }) {
    const navigate = useNavigate();

    const [entityData, setEntityData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    // Unique ID for Swiper navigation
    const id = subtitle?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).substring(2, 9);

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getBookByBookDefinitionsForUser(params);
                let { items } = response.data.data;

                if (currentBookId) {
                    items = items.filter((book) => book.id !== currentBookId);
                }
                setEntityData(items);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, [filters]);

    const prevClass = `.custom-prev-${id}`;
    const nextClass = `.custom-next-${id}`;

    return (
        <section className={cx('wrapper', 'sectionspace')}>
            <div className="container">
                <div className="row mb-3">
                    <div className="col-12">
                        <SectionHeader
                            subtitle={subtitle}
                            title={title}
                            onViewAll={() => navigate('/books')}
                            onPrev={() => document.querySelector(prevClass)?.click()}
                            onNext={() => document.querySelector(nextClass)?.click()}
                            prevClass={`custom-prev-${id}`}
                            nextClass={`custom-next-${id}`}
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
                                slidesPerGroup={1}
                                loop={false}
                                navigation={{
                                    prevEl: prevClass,
                                    nextEl: nextClass,
                                }}
                                watchOverflow
                                grabCursor
                                className={cx('swiper-container', 'p-3')}
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
