import { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from '~/styles/ScrollToTopButton.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 100); // hiện khi cuộn hơn 100px
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            className={cx('scrollToTop', { visible: isVisible })}
            onClick={scrollToTop}
            aria-label="Lên đầu trang"
            title="Lên đầu trang"
        >
            <FaArrowUp />
        </button>
    );
}

export default ScrollToTopButton;
