import { Link } from 'react-router-dom';

import classNames from 'classnames/bind';
import styles from '~/styles/Breadcrumb.module.scss';

const cx = classNames.bind(styles);

function Breadcrumb({ items }) {
    return (
        <ul className={cx('breadcrumb')}>
            {items.map((item, index) => (
                <li key={index}>{item.url ? <Link to={item.url}>{item.label}</Link> : <span>{item.label}</span>}</li>
            ))}
        </ul>
    );
}

export default Breadcrumb;
