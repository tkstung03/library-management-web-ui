import { BrowserRouter, Route, Routes } from 'react-router-dom';

import DefaultLayout from './layouts/DefaultLayout';

import RequireAuth from './utils/RequireAuth';
import { ROLES } from './common/roleConstants';

import Home from './pages/Misc/Home';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AccessDenied from './pages/Misc/AccessDenied';
import NotFound from './pages/Misc/NotFound';
import News from './pages/Misc/News';
import About from './pages/Misc/About';
import HolidaySchedule from './pages/Misc/HolidaySchedule';
import Rules from './pages/Misc/Rules';
import Report from './pages/Misc/Report';
import Search from './pages/Misc/Search';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/Auth/AdminLogin';
import AdminForgotPassword from './pages/Auth/AdminForgotPassword';
import Author from './pages/Authors/Author';
import AuthorForm from './pages/Authors/AuthorForm';
import BookSet from './pages/BookSet/BookSet';
import Category from './pages/Category/Category';
import Publisher from './pages/Publisher/Publisher';
import BookDefinition from './pages/BookDefinition/BookDefinition';
import BookDefinitionForm from './pages/BookDefinition/BookDefinitionForm';
import ClassificationSymbol from './pages/ClassificationSymbol/ClassificationSymbol';
import History from './pages/History/History';
import BookDetail from './pages/Books/BookDetail';
import InwardBook from './pages/Books/InwardBook';
import OutwardBook from './pages/Books/OutwardBook';
import InwardBookForm from './pages/Books/InwardBookForm';
import BookList from './pages/Books/BookList';
import InventoryBook from './pages/Books/InventoryBook';
import OutwardBookForm from './pages/Books/OutwardBookForm';
import BookCollection from './pages/Books/BookCollection';
import NewsArticles from './pages/NewsArticles/NewsArticles';
import NewsArticlesForm from './pages/NewsArticles/NewsArticlesForm';
import Dashboard from './pages/Dashboard/Dashboard';
import LibraryInfo from './pages/settings/LibraryInfo';
import LibraryRules from './pages/settings/LibraryRules';
import Holidays from './pages/settings/Holidays';
import GeneralConfig from './pages/settings/GeneralConfig';
import SlideConfig from './pages/settings/SlideConfig';
import User from './pages/User/User';
import UserForm from './pages/User/UserForm';
import UserGroup from './pages/UserGroup/UserGroup';
import Reader from './pages/Reader/Reader';
import LibraryVisit from './pages/LibraryVisit/LibraryVisit';
import VisitorStatistics from './pages/LibraryVisit/VisitorStatistics';
import ReaderViolations from './pages/Reader/ReaderViolations';
import NewsArticleDetail from './pages/NewsArticles/NewsArticleDetail';
import BorrowBook from './pages/BorrowBook/BorrowBook';
import ReturnRenewBook from './pages/ReturnRenewBook/ReturnRenewBook';
import BorrowBookForm from './pages/BorrowBook/BorrowBookForm';
import UserProfile from './pages/UserProfile/UserProfile';
import BorrowedItems from './pages/BorrowedItems/BorrowedItems';
import BorrowHistory from './pages/BorrowHistory/BorrowHistory';
import BorrowRequests from './pages/BorrowRequests/BorrowRequests';
import ReturnHistory from './pages/ReturnRenewBook/ReturnHistory';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<DefaultLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />

                    <Route path="news" element={<News />} />
                    <Route path="about" element={<About />} />
                    <Route path="holiday-schedule" element={<HolidaySchedule />} />
                    <Route path="rules" element={<Rules />} />
                    <Route path="report" element={<Report />} />
                    <Route path="search" element={<Search />} />
                    <Route path="books" element={<BookCollection />} />
                    <Route path="books/:id" element={<BookDetail />} />
                    <Route path="news-articles/:id" element={<NewsArticleDetail />} />

                    {/* Đường dẫn yêu cầu đăng nhập */}
                    <Route element={<RequireAuth />}>
                        {/* Thông tin cá nhân */}
                        <Route path="profile" element={<UserProfile />} />

                        {/* Lịch sử mượn */}
                        <Route path="borrow-history" element={<BorrowHistory />} />

                        {/* Đã đăng ký mượn */}
                        <Route path="borrowed-items" element={<BorrowedItems />} />
                    </Route>
                </Route>

                <Route
                    element={
                        <RequireAuth
                            allowedRoles={[
                                ROLES.ManageAuthor,
                                ROLES.ManageNewsArticle,
                                ROLES.ManageUser,
                                ROLES.ManageClassificationSymbol,
                                ROLES.ManageCategory,
                                ROLES.ManageBookSet,
                                ROLES.ManageLog,
                                ROLES.ManageRole,
                                ROLES.ManageBook,
                                ROLES.ManageImportReceipt,
                                ROLES.ManageBookDefinition,
                                ROLES.ManageCategoryGroup,
                                ROLES.ManagePublisher,
                                ROLES.ManageSystemSettings,
                                ROLES.ManageBorrowReceipt,
                                ROLES.ManageReader,
                            ]}
                        />
                    }
                >
                    {/* Đường dẫn yêu cầu quyền quản trị */}
                    <Route path="admin/" element={<AdminLayout />}>
                        {/* Trang chủ */}
                        <Route index element={<Dashboard />} />
                        <Route path="home" element={<Dashboard />} />

                        {/* Yêu cầu mượn tài liệu */}
                        <Route path="borrow-requests" element={<BorrowRequests />} />

                        {/* Thiết lập hệ thống */}
                        <Route path="settings">
                            <Route path="library-info" element={<LibraryInfo />} />
                            <Route path="library-rules" element={<LibraryRules />} />
                            <Route path="holidays" element={<Holidays />} />
                            <Route path="general-config" element={<GeneralConfig />} />
                            <Route path="slide-config" element={<SlideConfig />} />
                        </Route>

                        {/* Quản lý người dùng */}
                        <Route path="users">
                            <Route index element={<User />} />
                            <Route path="new" element={<UserForm />} />
                            <Route path="edit/:id" element={<UserForm />} />
                        </Route>

                        {/* Quản lý bạn đọc */}
                        <Route path="readers">
                            <Route path="cards" element={<Reader />} />
                            <Route path="access">
                                <Route index element={<LibraryVisit />} />
                                <Route path="statistics" element={<VisitorStatistics />} />
                            </Route>
                            <Route path="violations" element={<ReaderViolations />} />
                        </Route>

                        {/* Quản lý nhóm người dùng */}
                        <Route path="user-groups">
                            <Route index element={<UserGroup />} />
                        </Route>

                        {/* Sách */}
                        <Route path="books">
                            <Route path="list" element={<BookList />} />

                            <Route path="inward">
                                <Route index element={<InwardBook />} />
                                <Route path="new" element={<InwardBookForm />} />
                                <Route path="edit/:id" element={<InwardBookForm />} />
                            </Route>

                            <Route path="inventory">
                                <Route index element={<InventoryBook />} />
                            </Route>

                            <Route path="outward">
                                <Route index element={<OutwardBook />} />
                                <Route path="new" element={<OutwardBookForm />} />
                                <Route path="edit/:id" element={<OutwardBookForm />} />
                            </Route>
                        </Route>

                        {/* Quản lý lưu thông */}
                        <Route path="circulation">
                            <Route path="borrow">
                                <Route index element={<BorrowBook />} />
                                <Route path="new" element={<BorrowBookForm />} />
                                <Route path="edit/:id" element={<BorrowBookForm />} />
                            </Route>

                            <Route path="return-renew" element={<ReturnRenewBook />} />
                            <Route path="return-history" element={<ReturnHistory />} />
                        </Route>

                        {/* Tác giả */}
                        <Route path="authors">
                            <Route index element={<Author />} />
                            <Route path="new" element={<AuthorForm />} />
                            <Route path="edit/:id" element={<AuthorForm />} />
                        </Route>

                        {/* Bộ sách */}
                        <Route path="collections">
                            <Route index element={<BookSet />} />
                        </Route>

                        {/* Danh mục */}
                        <Route path="categories">
                            <Route index element={<Category />} />
                        </Route>

                        {/* Nhà xuất bản */}
                        <Route path="publishers">
                            <Route index element={<Publisher />} />
                        </Route>

                        {/* Biên mục */}
                        <Route path="book-definitions">
                            <Route index element={<BookDefinition />} />
                            <Route path="new" element={<BookDefinitionForm mode="new" />} />
                            <Route path="edit/:id" element={<BookDefinitionForm mode="edit" />} />
                            <Route path="copy/:id" element={<BookDefinitionForm mode="copy" />} />
                        </Route>

                        {/* Kí hiệu phân loại */}
                        <Route path="classifications">
                            <Route index element={<ClassificationSymbol />} />
                        </Route>

                        {/* Tin tức */}
                        <Route path="news-articles">
                            <Route index element={<NewsArticles />} />
                            <Route path="new" element={<NewsArticlesForm />} />
                            <Route path="edit/:id" element={<NewsArticlesForm />} />
                        </Route>

                        {/* Lịch sử */}
                        <Route path="histories">
                            <Route index element={<History />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="admin/login" element={<AdminLogin />} />
                <Route path="admin/forgot-password" element={<AdminForgotPassword />} />

                <Route path="access-denied" element={<AccessDenied />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
