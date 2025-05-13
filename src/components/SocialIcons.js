import images from '~/assets';
import classNames from 'classnames/bind';
import styles from '~/styles/Footer.module.scss';

const cx = classNames.bind(styles);

function SocialIcons() {
    return (
        <ul className={cx('socialicons')}>
            <li className="facebook">
                <a href="/">
                    <img width={30} src={images.facebook} alt="icon" />
                </a>
            </li>
            <li className="twitter">
                <a href="/">
                    <img width={30} src={images.twitter} alt="icon" />
                </a>
            </li>
            <li className="linkedin">
                <a href="/">
                    <img width={30} src={images.linkedin} alt="icon" />
                </a>
            </li>
            <li className="googleplus">
                <a href="/">
                    <img width={30} src={images.googleplus} alt="icon" />
                </a>
            </li>
            <li className="rss">
                <a href="/">
                    <img width={30} src={images.rss} alt="icon" />
                </a>
            </li>
        </ul>
    );
}

export default SocialIcons;
