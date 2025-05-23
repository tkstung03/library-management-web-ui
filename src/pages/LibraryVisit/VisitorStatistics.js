import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Col, DatePicker, Flex, Form, message, Row, Space, Table } from 'antd';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { getLibraryVisits } from '~/services/libraryVisitService';
import { getLibraryVisitReportPdf } from '~/services/libraryVisitService';

function VisitorStatistics() {
    const naviagate = useNavigate();
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const handleChangePage = (newPage) => {
        setFilters((prev) => ({ ...prev, pageNumb: newPage }));
    };

    const handleChangeRowsPerPage = (current, size) => {
        setFilters((prev) => ({
            ...prev,
            pageNumb: 1,
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

    const handlePrintReport = async () => {
        if (!filters.startDate || !filters.endDate) {
            messageApi.error('Vui lòng chọn ngày bắt đầu và kết thúc trước khi in báo cáo.');
            return;
        }

        setIsLoading(true);
        try {
            setIsLoading(true);
            const query = queryString.stringify({
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
            const response = await getLibraryVisitReportPdf(query, { responseType: 'blob' });

            if (response.status === 200) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);
                const newTab = window.open(url, '_blank');
                newTab.focus();
                //URL.revokeObjectURL(url);
            }
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất dữ liệu.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onFinish = (values) => {
        const startDate = values.startDate ? values.startDate.format('YYYY-MM-DD') : null;
        const endDate = values.endDate ? values.endDate.format('YYYY-MM-DD') : null;

        if (startDate && endDate) {
            setFilters((prev) => ({
                ...prev,
                startDate,
                endDate,
                pageNumb: 1,
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
                // Đảm bảo không có kết quả thì entityData là []
            setEntityData(Array.isArray(items) ? items : []);
            setMeta(meta || INITIAL_META);
            } catch (error) {
                setErrorMessage(error.message);
                setEntityData([]); 
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
            title: 'Chuyên ngành',
            dataIndex: 'major',
            key: 'major',
            sorter: true,
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
                                <Button onClick={handlePrintReport}>In báo cáo</Button>
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
                    current: filters.pageNumb,
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
