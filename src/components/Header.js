import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosLogOut } from 'react-icons/io';
import { FaUser, FaRegUser } from 'react-icons/fa6';
import { MdMailOutline, MdHelpOutline } from 'react-icons/md';
import { FaRegEdit, FaHistory, FaAngleDown } from 'react-icons/fa';
import { Dropdown, Space, Input, Select } from 'antd';
import useAuth from '~/hooks/useAuth';
import 'bootstrap/dist/js/bootstrap.bundle';
import queryString from 'query-string';
import classNames from 'classnames/bind';
import styles from '~/styles/Header.module.scss';
import { ROLES } from '~/common/roleConstants';

const cx = classNames.bind(styles);

const { Search } = Input;

const options = [
    {
        label: 'Nhan đề',
        value: 'title',
    },
    {
        label: 'Tác giả',
        value: 'author',
    },
    {
        label: 'Từ khóa',
        value: 'keyword',
    },
    {
        label: 'Năm xuất bản',
        value: 'publishingYear',
    },
    {
        label: 'Số ISBN',
        value: 'bookCode',
    },
];

function Header() {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [activeFilterOption, setActiveFilterOption] = useState(options[0].value);

    const { isAuthenticated, user, logout } = useAuth();
    const hasRequiredRole = isAuthenticated && user.roleNames[0] === ROLES.Reader;

    const items = hasRequiredRole
        ? [
              {
                  key: '1',
                  label: <Link to="/profile">Thông tin cá nhân</Link>,
                  icon: <FaUser />,
              },
              {
                  key: '2',
                  label: <Link to="/borrow-history">Lưu thông</Link>,
                  icon: <FaHistory />,
              },
              {
                  key: '3',
                  label: <Link to="/borrowed-items">Đã đăng ký mượn</Link>,
                  icon: <FaRegEdit />,
              },
              {
                  key: '4',
                  label: 'Đăng xuất',
                  icon: <IoIosLogOut />,
                  onClick: logout,
              },
          ]
        : [
              {
                  key: '4',
                  label: <Link to="/login">Đăng nhập</Link>,
                  icon: <IoIosLogOut />,
              },
          ];

    const handleSearch = (value) => {
        if (value.trim()) {
            const params = queryString.stringify({ type: activeFilterOption, value: value.trim() });
            navigate(`/search?${params}`);
        }
    };

    return (
        <header>
            <div className={cx('wrapper')}>
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-auto">
                            <ul className={cx('list')}>
                                <li>
                                    <Link to="/report">
                                        <MdMailOutline />
                                        Liên hệ
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/">
                                        <MdHelpOutline />
                                        Trợ giúp
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="col-auto">
                            <Dropdown
                                menu={{
                                    items,
                                }}
                            >
                                <Space>
                                    <FaRegUser />
                                    {hasRequiredRole ? user.name : 'Tài khoản'}
                                    <FaAngleDown />
                                </Space>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                <div className="row align-items-center">
                    <div className="col-4">
                        <h1>Library Manager</h1>
                    </div>
                    <div className="col-8">
                        <Space.Compact className="w-100">
                            <Select
                                size="large"
                                defaultValue="title"
                                options={options}
                                value={activeFilterOption}
                                onChange={(value) => setActiveFilterOption(value)}
                            />
                            <Search
                                size="large"
                                name="search"
                                placeholder="Nhập nội dung tìm kiếm của bạn ở đây"
                                allowClear
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onSearch={handleSearch}
                            />
                        </Space.Compact>

                        <div className="text-lg-end">
                            <Link to="/search?tab=2">+ Tìm kiếm nâng cao</Link>
                        </div>
                    </div>
                </div>
            </div>

            <nav className={cx('navbar', 'p-lg-0', 'navbar-expand-lg', 'navigationarea')}>
                <div className="container">
                    <Link className="navbar-brand text-white" to="/">
                        Trang chủ
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className={cx('nav-item', 'dropdown')}>
                                <Link
                                    className="nav-link dropdown-toggle px-4 py-3 text-white"
                                    to="#"
                                    id="libraryDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Thư viện
                                </Link>
                                <ul className="dropdown-menu" aria-labelledby="libraryDropdown">
                                    <li>
                                        <Link className="dropdown-item" to="/books">
                                            Sách
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className={cx('nav-item')}>
                                <Link className="nav-link px-4 py-3 text-white active" aria-current="page" to="/news">
                                    Tin tức
                                </Link>
                            </li>
                            <li className={cx('nav-item')}>
                                <Link className="nav-link px-4 py-3 text-white" to="/about">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li className={cx('nav-item')}>
                                <Link className="nav-link px-4 py-3 text-white" to="/holiday-schedule">
                                    Lịch nghỉ lễ
                                </Link>
                            </li>
                            <li className={cx('nav-item')}>
                                <Link className="nav-link px-4 py-3 text-white" to="/rules">
                                    Nội quy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
