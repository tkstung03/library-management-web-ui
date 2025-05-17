import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import classNames from 'classnames/bind';
import styles from '~/styles/PostList.module.scss';
import Post from './Post';
import SectionHeader from './SectionHeader';
import { getNewsArticlesForUser } from '~/services/newsArticlesService';

const cx = classNames.bind(styles);

function PostList() {
    const swiperRef = useRef(null);
    const navigate = useNavigate();

    const [entityData, setEntityData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getNewsArticlesForUser();
                const { items } = response.data.data;
                setEntityData(items);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, []);

    const goToNextSlide = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideNext();
        }
    };

    const goToPrevSlide = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slidePrev();
        }
    };

    const handleViewAll = () => {
        navigate('/news');
    };

    return (
        <section className={cx('wrapper', 'sectionspace')}>
            <div className="container">
                <div className="row mb-3">
                    <div className="col-12">
                        <SectionHeader
                            subtitle="Tin tức & bài viết mới nhất"
                            title={<h2 className="mb-0">Tin nổi bật trong ngày</h2>}
                            onPrev={goToPrevSlide}
                            onNext={goToNextSlide}
                            onViewAll={handleViewAll}
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
                                ref={swiperRef}
                                modules={[Navigation]}
                                navigation={false}  // Ẩn nút navigation của swiper, dùng nút custom của bạn
                                slidesPerView={5}
                                spaceBetween={10}
                                loop={true}
                            >
                                {entityData.map((data) => (
                                    <SwiperSlide key={data.id || data.titleSlug}>
                                        <Post className="mx-2 my-1" data={data} />
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

export default PostList;
