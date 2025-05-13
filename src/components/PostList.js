import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import classNames from 'classnames/bind';
import styles from '~/styles/PostList.module.scss';
import Post from './Post';
import SectionHeader from './SectionHeader';
import { getNewsArticlesForUser } from '~/services/newsArticlesService';

const cx = classNames.bind(styles);

function PostList() {
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    const [entityData, setEntityData] = useState(null);

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

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        swipeToSlide: true,
    };

    const goToNextSlide = () => {
        sliderRef.current.slickNext();
    };

    const goToPrevSlide = () => {
        sliderRef.current.slickPrev();
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
                            <Slider ref={sliderRef} {...settings}>
                                {entityData.map((data, index) => (
                                    <Post className="mx-2 my-1" key={index} data={data} />
                                ))}
                            </Slider>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PostList;
