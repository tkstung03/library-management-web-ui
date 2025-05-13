import { useEffect, useState } from 'react';
import { Parallax } from 'react-parallax';

import { ImBooks, ImUserPlus } from 'react-icons/im';
import { FiUsers } from 'react-icons/fi';
import { BsShop } from 'react-icons/bs';
import CountUp from 'react-countup';
import { Button, message, Statistic } from 'antd';

import { backgrounds } from '~/assets';
import ProductList from '~/components/ProductList';
import Slider from '~/components/Slider';

import classNames from 'classnames/bind';
import styles from '~/styles/Home.module.scss';
import PostList from '~/components/PostList';
import { getLibraryInfoStats } from '~/services/statisticsService';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const formatter = (value) => <CountUp end={value} duration={10} separator="," />;

function Home() {
    const navigate = useNavigate();
    const [libraryStats, setLibraryStats] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const handleCreateReport = () => {
        navigate('/report');
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getLibraryInfoStats();
                const { publications, authors, publishers, readers } = response.data.data;
                setLibraryStats([
                    { title: 'Số ấn phẩm', icon: <ImBooks />, count: publications, className: 'books' },
                    { title: 'Số tác giả', icon: <FiUsers />, count: authors, className: 'authors' },
                    { title: 'Số nhà xuất bản', icon: <BsShop />, count: publishers, className: 'publishers' },
                    { title: 'Số bạn đọc', icon: <ImUserPlus />, count: readers, className: 'readers' },
                ]);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, []);

    return (
        <>
            {contextHolder}

            <Slider />

            <ProductList
                filters={{
                    sortBy: 'title',
                    sortType: 'DESC',
                }}
                title={<h2 className="mb-0">Sách được mượn nhiều nhất</h2>}
                subtitle={'Lựa chọn của mọi người'}
                messageApi={messageApi}
            />

            <Parallax bgImage={backgrounds.bgparallax4} strength={500}>
                <div className="container py-5">
                    <div className="row">
                        {isLoading ? (
                            <>Loading</>
                        ) : errorMessage ? (
                            <>{errorMessage}</>
                        ) : (
                            libraryStats.map((item, index) => (
                                <div key={index} className={cx('col-3', 'collectioncounter', item.className)}>
                                    <div className={cx('collectioncountericon')}>{item.icon}</div>
                                    <div className={cx('titlepluscounter')}>
                                        <h2>{item.title}</h2>
                                        <h3>
                                            <Statistic value={item.count} formatter={formatter} />
                                        </h3>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Parallax>

            <ProductList
                filters={{
                    sortBy: 'id',
                    sortType: 'DESC',
                }}
                title={<h2 className="mb-0">Sách mới phát hành</h2>}
                subtitle={'Sách mới'}
                messageApi={messageApi}
            />

            <Parallax bgImage={backgrounds.bgparallax5} strength={500}>
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-auto py-5">
                            <Button type="primary" onClick={handleCreateReport}>
                                Gửi nhận xét của bạn
                            </Button>
                        </div>
                    </div>
                </div>
            </Parallax>

            <PostList />
        </>
    );
}

export default Home;
