import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, message } from 'antd';
import { Parallax } from 'react-parallax';
import images, { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';
import classNames from 'classnames/bind';
import styles from '~/styles/BookDetail.module.scss';
import SocialIcons from '~/components/SocialIcons';
import { getBookDetailForUser } from '~/services/bookDefinitionService';
import { addToCart } from '~/services/cartService';
import useAuth from '~/hooks/useAuth';
import { RESOURCE_URL } from '~/common/commonConstants';
import ProductList from '~/components/ProductList';

const cx = classNames.bind(styles);

function BookDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [entityData, setEntityData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const handleAddToCart = async (id) => {
        if (isAuthenticated) {
            try {
                const response = await addToCart(id);
                if (response.status === 201) {
                    messageApi.success(response.data.data.message);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi mượn sách.';
                messageApi.error(errorMessage);
            }
        } else {
            navigate('/login', { replace: true, state: { from: location } });
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getBookDetailForUser(id);
                const { data } = response.data;
                setEntityData(data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, [id]);

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Thư viện sách',
            url: '/books',
        },
        {
            label: 'Sách tiếng việt',
        },
    ];

    return (
        <>
            {contextHolder}

            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Chi tiết sách</h1>
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
                    <div className="col-10">
                        {isLoading ? (
                            <>Loading</>
                        ) : errorMessage ? (
                            <>{errorMessage}</>
                        ) : (
                            <div className={cx('content')}>
                                <div className="row">
                                    <div className="col-1"></div>
                                    <div className="col-4">
                                        <img
                                            className={cx('image')}
                                            src={entityData.imageUrl || images.placeimg}
                                            alt=""
                                        />
                                        <Button type="primary" block onClick={() => handleAddToCart(entityData.id)}>
                                            Đăng ký mượn
                                        </Button>
                                    </div>
                                    
                                    <div className="col-7">
                                        <ul className={cx('category')}>
                                            <li>Số lượng sách còn trong thư viện: {entityData.bookCount}</li>
                                        </ul>

                                        <div className={cx('title')}>
                                            <h3>{entityData.title}</h3>
                                        </div>

                                        <span className={cx('writer')}>
                                            Tác giả:&nbsp;
                                            {entityData.authors && entityData.authors.length > 0
                                                ? entityData.authors.map((author, index) => (
                                                      <React.Fragment key={author.id || index}>
                                                          <Link to={`/books?authorId=${author.id}`}>{author.name}</Link>
                                                          {index < entityData.authors.length - 1 && ', '}
                                                      </React.Fragment>
                                                  ))
                                                : 'Không xác định'}
                                        </span>

                                        <div className={cx('share')}>
                                            <span>Share:</span>
                                            <SocialIcons />
                                        </div>

                                        <div className={cx('description')}>
                                            <p>
                                                {entityData.summary
                                                    ? entityData.summary
                                                    : 'Chưa có mô tả cho cuốn sách này'}
                                            </p>
                                        </div>

                                        <SectionHeader title={<h5 className="mb-0">Chi tiết sách</h5>} />

                                        <ul className={cx('info')}>
                                            <li>
                                                <span>Số trang:</span>
                                                <span>{entityData.pageCount || 'N/A'}</span>
                                            </li>
                                            <li>
                                                <span>Kích thước:</span>
                                                <span>{entityData.bookSize ? entityData.bookSize : 'N/A'}</span>
                                            </li>
                                            <li>
                                                <span>Năm xuất bản:</span>
                                                <span>{entityData.publishingYear || 'N/A'}</span>
                                            </li>
                                            <li>
                                                <span>Nhà xuất bản:</span>
                                                <span>{entityData.publisher ? entityData.publisher.name : 'N/A'}</span>
                                            </li>
                                            <li>
                                                <span>Ngôn ngữ:</span>
                                                <span>{entityData.language || 'N/A'}</span>
                                            </li>
                                            <li>
                                                <span>ISBN:</span>
                                                <span>{entityData.isbn || 'N/A'}</span>
                                            </li>

                                            {entityData.pdfUrl && (
                                                <li>
                                                    <span>Xem trước PDF: </span>
                                                    <span>
                                                        {' '}
                                                        <a
                                                            href={RESOURCE_URL + entityData.pdfUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: 'red' }}
                                                        >
                                                            TẠI ĐÂY
                                                        </a>
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {entityData && entityData.category && (
                    <div className="row mb-4">
                        <ProductList
                            filters={{ categoryId: String(entityData.category.id) }}
                            
                            title={<h2 className="mb-0">Sách tương tự</h2>}
                            subtitle={'Có thể bạn cũng thích'}
                            messageApi={messageApi}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

export default BookDetail;
