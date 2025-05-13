import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Product from './Product';
import SectionHeader from './SectionHeader';

import classNames from 'classnames/bind';
import styles from '~/styles/ProductList.module.scss';
import { getBookByBookDefinitionsForUser } from '~/services/bookDefinitionService';
import queryString from 'query-string';

const cx = classNames.bind(styles);

function ProductList({ filters, title, subtitle, messageApi }) {
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    const [entityData, setEntityData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const goToNextSlide = () => {
        sliderRef.current.slickNext();
    };

    const goToPrevSlide = () => {
        sliderRef.current.slickPrev();
    };

    const handleViewAll = () => {
        navigate('/books');
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        swipeToSlide: true,
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
                                    <Product className="mx-2 my-1" key={index} data={data} messageApi={messageApi} />
                                ))}
                            </Slider>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductList;
