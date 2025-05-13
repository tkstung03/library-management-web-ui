import { useEffect, useState } from 'react';
import { message } from 'antd';
import { Parallax } from 'react-parallax';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';
import { getAllHolidays } from '~/services/systemSettingService';
import queryString from 'query-string';
import dayjs from 'dayjs';

function HolidaySchedule() {
    const [entityData, setEntityData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Lịch nghỉ lễ',
        },
    ];

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify({ activeFlag: true });
                const response = await getAllHolidays(params);

                const holidaysWithDays = response.data.data.map((holiday) => {
                    const startDate = dayjs(holiday.startDate);
                    const endDate = dayjs(holiday.endDate);
                    const numberOfDays = endDate.diff(startDate, 'day') + 1;
                    return { ...holiday, numberOfDays };
                });
                setEntityData(holidaysWithDays);
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
                        <SectionHeader title={<h2 className="mb-0">Lịch nghỉ lễ</h2>} subtitle="Lịch nghỉ" />
                    </div>
                    <div className="col-12">
                        <table className="table table-striped table-responsive table-bordered table-hover">
                            <thead>
                                <tr role="row">
                                    <th>Tên kỳ nghỉ</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Nghỉ hết ngày</th>
                                    <th>Số ngày nghỉ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                Loading
                                            </td>
                                        </tr>
                                    </>
                                ) : errorMessage ? (
                                    <>
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                Lỗi: {errorMessage}
                                            </td>
                                        </tr>
                                    </>
                                ) : entityData && entityData.length > 0 ? (
                                    entityData.map((holiday, index) => (
                                        <tr key={holiday.id || index}>
                                            <td>{holiday.name}</td>
                                            <td>{holiday.startDate}</td>
                                            <td>{holiday.endDate}</td>
                                            <td>{holiday.numberOfDays}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HolidaySchedule;
