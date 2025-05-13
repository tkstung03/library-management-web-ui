import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Col, DatePicker, Flex, Form, message, Row, Space, Table } from 'antd';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { getLibraryVisits } from '~/services/libraryVisitService';

function VisitorStatistics() {
    const naviagate = useNavigate();
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const handleChangePage = (newPage) => {
        setFilters((prev) => ({ ...prev, pageNum: newPage }));
    };

    const handleChangeRowsPerPage = (current, size) => {
        setFilters((prev) => ({
            ...prev,
            pageNum: 1,
            pageSize: size,
        }));
    };

    const handleSortChange = (pagination, filters, sorter) => {
        const sortOrder = sorter.order === 'ascend' ? true : sorter.order === 'descend' ? false : undefined;
        setFilters((prev) => ({
            ...prev,
            sortBy: sorter.field,
            isAscending: sortOrder,
        }));
    };

    const onFinish = (values) => {
        const startDate = values.startDate ? values.startDate.format('YYYY-MM-DD') : null;
        const endDate = values.endDate ? values.endDate.format('YYYY-MM-DD') : null;

        if (startDate && endDate) {
            setFilters((prev) => ({
                ...prev,
                startDate,
                endDate,
                pageNum: 1,
            }));
        } else {
            messageApi.error('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc!');
        }
    };

    useEffect(() => {
        const fetchStatistics = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getLibraryVisits(params);
                const { meta, items } = response.data.data;
                setEntityData(items);
                setMeta(meta);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (filters.startDate && filters.endDate) {
            fetchStatistics();
        }
    }, [filters]);

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Số thẻ',
            dataIndex: 'cardNumber',
            key: 'cardNumber',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Loại thẻ',
            dataIndex: 'cardType',
            key: 'cardType',
        },
        {
            title: 'Giờ vào',
            dataIndex: 'entryTime',
            key: 'entryTime',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Giờ ra',
            dataIndex: 'exitTime',
            key: 'exitTime',
            sorter: true,
            showSorterTooltip: false,
        },
    ];

    if (errorMessage) {
        return (
            <div className="alert alert-danger p-2" role="alert">
                Lỗi: {errorMessage}
            </div>
        );
    }

    return (
        <div>
            {contextHolder}

            <h2>Sổ sách thư viện</h2>

            <Form name="visitor_statistics" onFinish={onFinish} layout="vertical">
                <Row gutter={16} justify="center">
                    <Col span={6}>
                        <Form.Item
                            label="Từ ngày"
                            name="startDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                        >
                            <DatePicker className="w-100" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Đến ngày"
                            name="endDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                        >
                            <DatePicker className="w-100" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16} justify="center">
                    <Col span={6}>
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Thống kê
                                </Button>
                                <Button>In báo cáo</Button>
                                <Button>Xuất file</Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Table
                bordered
                rowKey="id"
                scroll={{ x: 'max-content' }}
                dataSource={entityData}
                columns={columns}
                loading={isLoading}
                onChange={handleSortChange}
                pagination={{
                    current: filters.pageNum,
                    pageSize: filters.pageSize,
                    total: meta.totalElements,
                    onChange: handleChangePage,
                    showSizeChanger: true,
                    onShowSizeChange: handleChangeRowsPerPage,
                }}
            />

            <Flex justify="flex-end">
                <Button type="link" onClick={() => naviagate('/admin/readers/access')}>
                    Quay lại
                </Button>
            </Flex>
        </div>
    );
}

export default VisitorStatistics;
