import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import BookCategory from './BookCategory';
import BookCategoryGroup from './BookCategoryGroup';

function Category() {
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const active = query.get('active') || '1';

    const onChange = (key) => {
        navigate(`?active=${key}`);
    };

    const items = [
        {
            key: '1',
            label: 'Loại sách',
            children: <BookCategory active={active} />,
        },
        {
            key: '2',
            label: 'Nhóm loại sách',
            children: <BookCategoryGroup />,
        },
    ];

    return <Tabs defaultActiveKey="1" activeKey={active} items={items} onChange={onChange} />;
}

export default Category;
