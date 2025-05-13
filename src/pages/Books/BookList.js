import { useState } from 'react';
import { Button, Flex, Space } from 'antd';
import BookListByCategory from './BookListByCategory';
import BookListByCode from './BookListByCode';

function BookList() {
    const [activeTab, setActiveTab] = useState(true);

    const handleTabChange = (isCategoryView) => {
        setActiveTab(isCategoryView);
    };

    return (
        <div>
            <Flex wrap justify="space-between" align="center">
                <h2>Danh sách sách</h2>

                <Space>
                    <Button onClick={() => handleTabChange(true)} type={activeTab ? 'primary' : 'default'}>
                        Xem theo đầu mục
                    </Button>
                    <Button onClick={() => handleTabChange(false)} type={!activeTab ? 'primary' : 'default'}>
                        Xem theo số ĐKCB
                    </Button>
                </Space>
            </Flex>

            {activeTab ? <BookListByCategory /> : <BookListByCode />}
        </div>
    );
}

export default BookList;
