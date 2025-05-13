import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { LuPhone } from 'react-icons/lu';
import { MdMailOutline } from 'react-icons/md';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import styles from '~/styles/Footer.module.scss';
import SocialIcons from './SocialIcons';
import useLibrary from '~/hooks/useLibrary';

const cx = classNames.bind(styles);

function Footer() {
    const { address, phoneNumber, email } = useLibrary();

    return (
        <footer className={cx('wrapper')}>
            <div className="container mb-5">
                <div className="row">
                    <div className="col-12">
                        <h1 className="py-5">Library Manager</h1>
                        <ul className={cx('contactinfo')}>
                            <li>
                                <HiOutlineBuildingOffice2 width={24} />
                                <span>Địa chỉ: {address}</span>
                            </li>
                            <li>
                                <LuPhone width={24} />
                                <span>Điện thoại: {phoneNumber}</span>
                            </li>
                            <li>
                                <MdMailOutline width={24} />
                                <span>Email: {email}</span>
                            </li>
                        </ul>

                        <SocialIcons />
                    </div>
                </div>
            </div>

            <div className={cx('bar')}>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <span>{dayjs().year()} All Rights Reserved By © NHÓM 16</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
