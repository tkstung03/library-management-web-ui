import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { Parallax } from 'react-parallax';
import { Button, Skeleton } from 'antd';
import images, { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import { getNewsArticleByTitleSlugForUser, getNewsArticlesForUser } from '~/services/newsArticlesService';
import classNames from 'classnames/bind';
import styles from '~/styles/NewsArticleDetail.module.scss';
import SocialIcons from '~/components/SocialIcons';
import Post from '~/components/Post';

const cx = classNames.bind(styles);

function NewsArticleDetail() {
    const { id } = useParams();

    const [articleDetail, setArticleDetail] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const fetchArticleDetail = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getNewsArticleByTitleSlugForUser(id);
                const { data } = response.data;
                setArticleDetail(data);
            } catch (error) {
                setErrorMessage(error.response.data.message || error.message);
            } finally {
                setIsLoading(false);
            }
        };
        const fetchRelatedArticles = async () => {
            try {
                const response = await getNewsArticlesForUser();
                const { items } = response.data.data;
                setRelatedArticles(items);
            } catch (error) {}
        };

        fetchArticleDetail();
        fetchRelatedArticles();
    }, [id]);

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Chi tiết bài viết',
        },
    ];

    return (
        <>
            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Chi tiết bài viết</h1>
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
                    <div className="col-4">
                        <div className="row">
                            <div className="col-12">
                                <Button block>Các bài đã đăng</Button>
                            </div>
                            {relatedArticles.map((data, index) => (
                                <div className="col-12">
                                    <Post
                                        className="mx-2 my-1"
                                        key={index}
                                        data={data}
                                        layout="horizontal"
                                        contentVisible={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-8">
                        {isLoading ? (
                            <>
                                <Skeleton active paragraph={{ rows: 5 }} />
                            </>
                        ) : errorMessage ? (
                            <div className="alert alert-danger p-2" role="alert">
                                Lỗi: {errorMessage}
                            </div>
                        ) : (
                            <>
                                <figure className={cx('newsdetailimg')}>
                                    <img src={articleDetail.imageUrl || images.placeimg} alt="description" />

                                    <figcaption className={cx('author')}>
                                        <span className="bookwriter">Tác giả: Admin</span>
                                        <ul className="postmetadata">
                                            <li>
                                                <FaRegCalendarAlt />
                                                <i className="ms-2">{articleDetail.createdDate}</i>
                                            </li>
                                        </ul>
                                    </figcaption>
                                </figure>

                                <div className={cx('newsdetail')}>
                                    <div className={cx('posttitle')}>
                                        <h3>{articleDetail.title}</h3>
                                    </div>

                                    <div className={cx('description')}>
                                        <q>{articleDetail.description}</q>
                                        <div
                                            className="ql-snow ql-editor p-0 mt-4"
                                            style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                                            dangerouslySetInnerHTML={{ __html: articleDetail.content }}
                                        />
                                    </div>
                                    <div className={cx('tagsshare')}>
                                        <span>Share:</span>
                                        <SocialIcons />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default NewsArticleDetail;
