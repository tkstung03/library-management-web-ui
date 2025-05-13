import { Link } from 'react-router-dom';
import { LiaCalendarSolid } from 'react-icons/lia';
import { Tag } from 'antd';
import { FaUser } from 'react-icons/fa';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import styles from '~/styles/Post.module.scss';
import images from '~/assets';

const cx = classNames.bind(styles);

function Post({ className, data, layout = 'vertical', contentVisible = true }) {
    const isNew = () => {
        const currentDate = dayjs();
        const postDate = dayjs(data.createdDate);
        const diffDays = currentDate.diff(postDate, 'day');
        return diffDays <= 7;
    };

    return (
        <div
            className={cx('wrapper', className, {
                horizontal: layout === 'horizontal',
            })}
        >
            <div className={cx('postimg')}>
                <Link to={`/news-articles/${data.titleSlug}`}>
                    <img src={data.image || images.placeimgHorizontal} alt={data.id} />
                </Link>
            </div>

            <div className={cx('postcontent')}>
                <ul className={cx('bookscategories')}>
                    <li>
                        <Link to={`/news-articles/${data.titleSlug}`} className="d-flex align-items-center">
                            <LiaCalendarSolid />
                            {data.createdDate}
                        </Link>
                    </li>
                    {isNew() && (
                        <li className="ms-2">
                            <Tag color="red">Mới nhất</Tag>
                        </li>
                    )}
                </ul>

                <div className={cx('posttitle')}>
                    <Link to={`/news-articles/${data.titleSlug}`}>{data.title}</Link>
                </div>

                {contentVisible && (
                    <>
                        <span className={cx('bookwriter')}>
                            <FaUser />
                            Tác giả:&nbsp;{data.author}
                        </span>

                        <div className={cx('postdes')}>{data.description}</div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Post;
