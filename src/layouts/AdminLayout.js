import React, { useEffect, useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Flex, Layout, Menu, Space, theme } from 'antd';
import dayjs from 'dayjs';
import { AiFillDashboard } from 'react-icons/ai';
import { IoMdSettings, IoIosLogOut } from 'react-icons/io';
import { BsNewspaper } from 'react-icons/bs';
import { BiCategory } from 'react-icons/bi';
import { FaUsers, FaUser, FaHistory, FaRecycle, FaBook, FaAngleDown } from 'react-icons/fa';
import images from '~/assets';
import { checkUserHasRequiredRole } from '~/utils/helper';
import { ROLES } from '~/common/roleConstants';
import useAuth from '~/hooks/useAuth';
import { FaChartBar } from 'react-icons/fa';

const { Header, Content, Footer, Sider } = Layout;

const menuConfig = [
    {
        label: 'Trang chủ',
        key: '/admin/home',
        icon: <AiFillDashboard />,
    },
    {
        label: 'Thiết lập hệ thống',
        key: '/admin/settings',
        icon: <IoMdSettings />,
        roles: [ROLES.ManageSystemSettings],
        children: [
            { label: 'Thông tin thư viện', key: '/admin/settings/library-info' },
            { label: 'Nội quy thư viện', key: '/admin/settings/library-rules' },
            { label: 'Kì nghỉ ngày lễ', key: '/admin/settings/holidays' },
            { label: 'Cấu hình chung', key: '/admin/settings/general-config' },
            { label: 'Thiết lập Slide', key: '/admin/settings/slide-config' },
        ],
    },
    {
        label: 'Quản lý người dùng',
        key: '/admin/user',
        icon: <FaUsers />,
        roles: [ROLES.ManageUser],
        children: [
            { label: 'Quản lý nhóm', key: '/admin/user-groups' },
            { label: 'Quản lý người dùng', key: '/admin/users' },
        ],
    },
    {
        label: 'Quản lý bạn đọc',
        key: '/admin/readers',
        icon: <FaUser />,
        roles: [ROLES.ManageReader],
        children: [
            { label: 'Thẻ bạn đọc', key: '/admin/readers/cards' },
            { label: 'Xử lý vi phạm', key: '/admin/readers/violations' },
            { label: 'Vào ra thư viện', key: '/admin/readers/access' },
        ],
    },
    {
        label: 'Quản lý danh mục',
        key: '/admin',
        icon: <BiCategory />,
        roles: [
            ROLES.ManageBookDefinition,
            ROLES.ManageCategory,
            ROLES.ManageCategoryGroup,
            ROLES.ManageBookSet,
            ROLES.ManageAuthor,
            ROLES.ManageClassificationSymbol,
            ROLES.ManagePublisher,
        ],
        children: [
            { label: 'Biên mục', key: '/admin/book-definitions', roles: [ROLES.ManageBookDefinition] },
            { label: 'Loại sách', key: '/admin/categories', roles: [ROLES.ManageCategory, ROLES.ManageCategoryGroup] },
            { label: 'Bộ sách', key: '/admin/collections', roles: [ROLES.ManageBookSet] },
            { label: 'Tác giả', key: '/admin/authors', roles: [ROLES.ManageAuthor] },
            { label: 'Ký hiệu phân loại', key: '/admin/classifications', roles: [ROLES.ManageClassificationSymbol] },
            { label: 'Nhà xuất bản', key: '/admin/publishers', roles: [ROLES.ManagePublisher] },
        ],
    },
    {
        label: 'Quản lý sách',
        key: '/admin/books',
        icon: <FaBook />,
        roles: [ROLES.ManageBook, ROLES.ManageImportReceipt],
        children: [
            { label: 'Danh sách sách', key: '/admin/books/list', roles: [ROLES.ManageBook] },
            { label: 'Nhập sách', key: '/admin/books/inward', roles: [ROLES.ManageImportReceipt] },
            // { label: 'Kiểm kê sách', key: '/admin/books/inventory', roles: [ROLES.ManageBook] },
            { label: 'Xuất sách', key: '/admin/books/outward', roles: [ROLES.ManageBook] },
        ],
    },
    {
        label: 'Quản lý lưu thông',
        key: '/admin/circulation',
        icon: <FaRecycle />,
        roles: [ROLES.ManageBorrowReceipt],
        children: [
            { label: 'Mượn sách', key: '/admin/circulation/borrow' },
            { label: 'Trả sách', key: '/admin/circulation/return-renew' },
            { label: 'Lịch sử trả sách', key: '/admin/circulation/return-history' },
        ],
    },
    {
        label: 'Thống kê báo cáo',
        key: '/admin/reports',
        icon: <FaChartBar />,
        children: [{ label: 'Báo cáo', key: '/admin/reports/statistics' }],
    },
    {
        label: 'Quản lý tin tức',
        key: '/admin/news-articles',
        icon: <BsNewspaper />,
        roles: [ROLES.ManageNewsArticle],
    },
    {
        label: 'Lịch sử truy cập',
        key: '/admin/histories',
        icon: <FaHistory />,
        roles: [ROLES.ManageLog],
    },
];

function AdminLayout() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const {
        user: { name, roleNames },
        logout,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState(location.pathname);

    useEffect(() => {
        setSelectedKey(location.pathname);
    }, [location.pathname]);

    const filterMenuItems = (items) => {
        return items.reduce((acc, item) => {
            const hasRole = item.roles ? item.roles.some((role) => checkUserHasRequiredRole(roleNames, role)) : true;
            if (hasRole) {
                const newItem = { ...item };
                if (newItem.children) {
                    newItem.children = filterMenuItems(newItem.children);
                }
                acc.push(newItem);
            }
            return acc;
        }, []);
    };

    const handleMenuItemClick = ({ key }) => {
        navigate(key);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const menuItems = useMemo(() => filterMenuItems(menuConfig), [roleNames]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sider */}
            <Sider collapsible width={220} collapsed={collapsed} onCollapse={setCollapsed}>
                <div className="text-center py-2">
                    <Link to="/" className="d-block">
                        <img src={images.logo} alt="logo" width={34} />
                    </Link>
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[selectedKey]}
                    mode="inline"
                    items={menuItems.map((item) => ({
                        key: item.key,
                        icon: item.icon,
                        label: item.label,
                        children: item.children?.map((child) => ({
                            key: child.key,
                            label: child.label,
                        })),
                    }))}
                    onClick={handleMenuItemClick}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                    className="shadow-sm"
                >
                    <Flex justify="space-between" align="center" style={{ margin: '0 16px' }}>
                        <div></div>
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: '1',
                                        label: 'Đăng xuất',
                                        icon: <IoIosLogOut />,
                                        onClick: logout,
                                    },
                                ],
                            }}
                        >
                            <Space>
                                Xin chào <b>{name}</b>
                                <FaAngleDown />
                            </Space>
                        </Dropdown>
                    </Flex>
                </Header>
                {/* Content */}
                <Content style={{ margin: '16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
                {/* Footer */}
                <Footer style={{ textAlign: 'center' }}>{dayjs().year()} All Rights Reserved By © NHÓM 16</Footer>
            </Layout>
        </Layout>
    );
}

export default AdminLayout;
