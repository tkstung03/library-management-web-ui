import { Parallax } from 'react-parallax';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';

import classNames from 'classnames/bind';
import styles from '~/styles/Rules.module.scss';
import { useEffect, useState } from 'react';
import { getLibraryRules } from '~/services/systemSettingService';

const cx = classNames.bind(styles);

function Rules() {
    const [libraryRules, setLibraryRules] = useState('');

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Nội quy chung của thư viện',
        },
    ];

    useEffect(() => {
        const fetchLibraryRules = async () => {
            try {
                const response = await getLibraryRules();
                if (response.status === 200) {
                    setLibraryRules(response.data.data);
                }
            } catch (error) {}
        };

        fetchLibraryRules();
    }, []);

    return (
        <>
            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Về chúng tôi</h1>
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
                <div className="row">
                    <div className="col-12 mb-4">
                        <SectionHeader title={<h2 className="mb-0">Nội quy của thư viện</h2>} subtitle="Nội quy" />
                    </div>
                    <div className="col-12">
                        <div className={cx('rules')}>
                            <div
                                className="ql-snow ql-editor p-0 mt-4"
                                style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                                dangerouslySetInnerHTML={{ __html: libraryRules }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Rules;
