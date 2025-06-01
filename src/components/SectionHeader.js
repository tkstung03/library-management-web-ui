import { Button, Space } from 'antd';
import PropTypes from 'prop-types';

import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';

import classNames from 'classnames/bind';
import styles from '~/styles/SectionHeader.module.scss';

const cx = classNames.bind(styles);

function SectionHeader({ title, subtitle, onViewAll, onPrev, onNext, prevClass, nextClass }) {
    const showButtons = onViewAll || onPrev || onNext;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('title')}>
                {subtitle && <span>{subtitle}</span>}
                {title}
            </div>

            {showButtons && (
                <Space>
                    {onViewAll && (
                        <Button shape="round" onClick={onViewAll}>
                            Xem Tất Cả
                        </Button>
                    )}

                    {onPrev && (
                        <Button shape="circle" icon={<MdNavigateBefore />} className={prevClass} onClick={onPrev} />
                    )}

                    {onNext && (
                        <Button shape="circle" icon={<MdNavigateNext />} className={nextClass} onClick={onNext} />
                    )}
                </Space>
            )}
        </div>
    );
}

SectionHeader.propTypes = {
    title: PropTypes.node.isRequired,
    subtitle: PropTypes.string,
    onViewAll: PropTypes.func,
    onPrev: PropTypes.func,
    onNext: PropTypes.func,
    prevClass: PropTypes.string,
    nextClass: PropTypes.string,
};

export default SectionHeader;
