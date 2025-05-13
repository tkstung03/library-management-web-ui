import { Parallax } from 'react-parallax';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import SectionHeader from '~/components/SectionHeader';

import { Button, Input } from 'antd';
const { TextArea } = Input;

function Report() {
    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Gửi thông tin đánh giá',
        },
    ];

    return (
        <>
            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Gửi thông tin phản hồi của bạn</h1>
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
                        <SectionHeader
                            title={<h2 className="mb-0">Liên hệ với chúng tôi</h2>}
                            subtitle="Thông tin phản hồi"
                        />
                    </div>
                </div>

                <form>
                    <div className="row g-4">
                        <div className="col-6">
                            <Input name="name" size="large" placeholder="Họ tên" autoComplete="on" />
                        </div>
                        <div className="col-6">
                            <Input name="address" size="large" placeholder="Địa chỉ" autoComplete="on" />
                        </div>
                        <div className="col-6">
                            <Input name="phoneNumber" size="large" placeholder="Số điện thoại" />
                        </div>
                        <div className="col-6">
                            <Input name="email" size="large" placeholder="Email" autoComplete="on" />
                        </div>

                        <div className="col-12">
                            <TextArea name="content" size="large" rows={8} placeholder="Nhập thông tin phản hồi" />
                        </div>

                        <div className="col-12">
                            <Button style={{ width: 200 }} type="primary" htmlType="submit" size="large">
                                Gửi
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Report;
