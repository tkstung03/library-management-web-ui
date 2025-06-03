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
    LabelList,
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

// const CHART_COLORS = ['#5cb85c', '#d9534f'];
const CHART_COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0'];

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
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 2000 }}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={categoryStatistics}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                    barCategoryGap={20}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="categoryName"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        height={80}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#f9f9f9', borderRadius: '5px' }}
                                        formatter={(value) => [`${value} ấn phẩm`, 'Số lượng']}
                                    />
                                    <Legend verticalAlign="top" />
                                    <Bar dataKey="count" name="Ấn phẩm" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                                        {categoryStatistics.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="count"
                                            position="top"
                                            style={{
                                                fill: '#333',
                                                fontWeight: 'bold',
                                                fontSize: 12,
                                            }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
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
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={3}
                                // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                labelLine={false}
                                isAnimationActive={true}
                            >
                                {loanStatusData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [`${value}%`, name]}
                                contentStyle={{ backgroundColor: '#f9f9f9', borderRadius: '5px' }}
                            />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ marginTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={cx('panel')}>
                <div className={cx('heading')}>
                    <FaBook /> &nbsp;<b>Ấn phẩm được mượn nhiều nhất</b>
                </div>
                <div className={cx('body')}>
                    <Timeline mode="alternate" className={cx('custom-timeline')}>
                        {topBorrowedBooks.map((publication, index) => {
                            const rankColor = ['#FFD700', '#C0C0C0', '#CD7F32']; // vàng, bạc, đồng
                            const iconColor = rankColor[index] || '#5cb85c';

                            return (
                                <Timeline.Item
                                    key={index}
                                    color="gray"
                                    dot={<FaBook style={{ fontSize: 18, color: iconColor }} />}
                                >
                                    <div className={cx('timeline-item-content')}>
                                        <h5 className={cx('title')}>
                                            <span className={cx('rank')} style={{ color: iconColor }}>
                                                #{index + 1}
                                            </span>{' '}
                                            {publication.title}
                                        </h5>
                                        <p className={cx('meta')}>
                                            <FaClock className="me-2" />
                                            {publication.borrowCount} lượt mượn
                                        </p>
                                    </div>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
