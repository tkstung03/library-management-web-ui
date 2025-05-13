import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Timeline } from 'antd';
import { FaEdit, FaThumbtack, FaBook, FaClock, FaBan, FaArrowAltCircleRight } from 'react-icons/fa';
import { IoBarChartSharp } from 'react-icons/io5';
import { FaChartPie } from 'react-icons/fa6';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import classNames from 'classnames/bind';
import styles from '~/styles/Dashboard.module.scss';
import {
    getBorrowStats,
    getLoanStatus,
    getMostBorrowedPublications,
    getPublicationStatisticsByCategory,
} from '~/services/statisticsService';

const cx = classNames.bind(styles);

const Card = ({ icon, count, label, link, color = 'white' }) => {
    return (
        <div className="card text-white" style={{ borderColor: color }}>
            <div className="card-header" style={{ backgroundColor: color }}>
                <div className="row">
                    <div className="col-3">{icon}</div>
                    <div className="col-9 text-end">
                        <div className="fs-1">{count}</div>
                        <div className="fw-bold">{label}</div>
                    </div>
                </div>
            </div>
            <Link to={link} style={{ color: color }}>
                <div className="card-footer">
                    <span className="float-start">Xem chi tiết</span>
                    <span className="float-end">
                        <FaArrowAltCircleRight />
                    </span>
                    <div className="clearfix" />
                </div>
            </Link>
        </div>
    );
};

const CHART_COLORS = ['#5cb85c', '#d9534f'];

function Dashboard() {
    const [borrowStatistics, setBorrowStatistics] = useState({
        borrowRequests: 0,
        currentlyBorrowed: 0,
        dueToday: 0,
        overdue: 0,
    });
    const [loanStatusData, setLoanStatusData] = useState([]);
    const [topBorrowedBooks, setTopBorrowedBooks] = useState([]);
    const [categoryStatistics, setCategoryStatistics] = useState([]);

    const fetchBorrowStatistics = async () => {
        try {
            const response = await getBorrowStats();
            setBorrowStatistics(response.data.data);
        } catch (error) {}
    };

    const fetchLoanStatusData = async () => {
        try {
            const response = await getLoanStatus();
            const data = response.data.data;

            const chartData = [
                { name: 'Đang cho mượn', value: data.percentageBorrowed },
                { name: 'Quá hạn', value: data.percentageOverdue },
            ];
            setLoanStatusData(chartData);
        } catch (error) {}
    };

    const fetchTopBorrowedBooks = async () => {
        try {
            const response = await getMostBorrowedPublications();
            setTopBorrowedBooks(response.data.data);
        } catch (error) {}
    };

    const fetchCategoryStatistics = async () => {
        try {
            const response = await getPublicationStatisticsByCategory();
            setCategoryStatistics(response.data.data);
        } catch (error) {}
    };

    useEffect(() => {
        fetchLoanStatusData();
        fetchBorrowStatistics();
        fetchTopBorrowedBooks();
        fetchCategoryStatistics();
    }, []);

    return (
        <div>
            <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                    <Card
                        icon={<FaEdit className="fs-1" />}
                        count={borrowStatistics.borrowRequests}
                        label="Yêu cầu mượn"
                        link="/admin/borrow-requests"
                        color="#337ab7"
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <Card
                        icon={<FaThumbtack className="fs-1" />}
                        count={borrowStatistics.currentlyBorrowed}
                        label="Số đang mượn"
                        link="/admin/circulation/borrow"
                        color="#5cb85c"
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <Card
                        icon={<FaClock className="fs-1" />}
                        count={borrowStatistics.dueToday}
                        label="Đến hạn trả"
                        link="/admin/circulation/borrow?type=1"
                        color="#f0ad4e"
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <Card
                        icon={<FaBan className="fs-1" />}
                        count={borrowStatistics.overdue}
                        label="Quá hạn trả"
                        link="/admin/circulation/borrow?type=4"
                        color="#d9534f"
                    />
                </div>
            </div>

            <div className={cx('panel')}>
                <div className={cx('heading')}>
                    <IoBarChartSharp /> &nbsp; <b>Biểu đồ thống kê số lượng ấn phẩm theo phân loại</b>
                </div>
                <div className={cx('body')}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryStatistics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="categoryName" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Ấn phẩm" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={cx('panel')}>
                <div className={cx('heading')}>
                    <FaChartPie /> &nbsp; <b>Tình hình mượn trả</b>
                </div>
                <div className={cx('body')}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={loanStatusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                            >
                                {loanStatusData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={cx('panel')}>
                <div className={cx('heading')}>
                    <FaBook /> &nbsp;<b>Ấn phẩm được mượn nhiều nhất</b>
                </div>
                <div className={cx('body')}>
                    <Timeline
                        mode="alternate"
                        items={topBorrowedBooks.map((publication, index) => ({
                            color: index % 2 === 0 ? 'gray' : 'green',
                            dot: <FaBook style={{ fontSize: '16px' }} />,
                            children: (
                                <>
                                    <strong>{publication.title}</strong>
                                    <p>
                                        <small className="text-muted">
                                            <FaClock /> {publication.borrowCount} lượt mượn
                                        </small>
                                    </p>
                                </>
                            ),
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
