import { useEffect, useState } from 'react';
import { Button, Flex, Form, Table, Tag } from 'antd';
import { Input, message, Popconfirm, Select, Space } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import queryString from 'query-string';
import dayjs from 'dayjs';
import { cardPenaltyForm } from '~/common/cardConstants';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { getReaders } from '~/services/readerService';
import { createReaderViolation, deleteReaderViolation } from '~/services/readerViolationsService';
import { getReaderViolations, updateReaderViolation } from '~/services/readerViolationsService';
import ViolationForm from './ViolationForm';

const options = [
    { value: 'cardNumber', label: 'Số thẻ' },
    { value: 'fullName', label: 'Họ tên' },
    { value: 'penaltyForm', label: 'Trạng thái' },
];

const penaltyFormMapping = {
    CARD_SUSPENSION: { label: 'Tạm dừng thẻ', color: 'blue' },
    CARD_REVOCATION: { label: 'Thu hồi thẻ', color: 'warning' },
    FINE: { label: 'Phạt tiền', color: 'red' },
};

const getTagByPenaltyForm = (text) => {
    const { label, color } = penaltyFormMapping[text] || { label: 'Khác', color: 'default' };
    return <Tag color={color}>{label}</Tag>;
};

function ReaderViolations() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);
    const [readers, setReaders] = useState([]);
    const [isReadersLoading, setIsReadersLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const [activeFilterOption, setActiveFilterOption] = useState(options[0].value);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    // Modal thêm mới
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm] = Form.useForm();

    // Modal chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editForm] = Form.useForm();

    const showAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        addForm.resetFields();
    };

    const showEditModal = (record) => {
        const values = {
            ...record,
            penaltyDate: record.penaltyDate ? dayjs(record.penaltyDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
            readerId: record.readerId,
        };

        setEditingItem(values);
        editForm.setFieldsValue(values);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
    };

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

    const handleSearch = (searchBy, keyword) => {
        setFilters((prev) => ({
            ...prev,
            pageNum: 1,
            searchBy: searchBy || activeFilterOption,
            keyword: keyword || searchInput,
        }));
    };

    const handleCreateEntity = async (values) => {
        setIsLoading(true);
        try {
            const formattedValues = {
                ...values,
                penaltyDate: values.penaltyDate ? values.penaltyDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
            };

            const response = await createReaderViolation(formattedValues);
            if (response.status === 201) {
                const { data, message } = response.data.data;
                messageApi.success(message);

                setEntityData((prevData) =>
                    prevData.length >= filters.pageSize ? [data, ...prevData.slice(0, -1)] : [data, ...prevData],
                );
                closeAddModal();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thêm mới.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateEntity = async (values) => {
        setIsLoading(true);
        try {
            const formattedValues = {
                ...values,
                penaltyDate: values.penaltyDate ? values.penaltyDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
            };

            const response = await updateReaderViolation(editingItem.id, formattedValues);
            if (response.status === 200) {
                const { data, message } = response.data.data;
                messageApi.success(message);

                setEntityData((prevData) => prevData.map((item) => (item.id === editingItem.id ? data : item)));
                closeEditModal();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEntity = async (id) => {
        try {
            const response = await deleteReaderViolation(id);
            if (response.status === 200) {
                setEntityData((prev) => prev.filter((a) => a.id !== id));

                messageApi.success(response.data.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa.';
            messageApi.error(errorMessage);
        }
    };

    const fetchReaders = async (keyword = '') => {
        setIsReadersLoading(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'fullName' });
            const response = await getReaders(params);
            const { items } = response.data.data;
            setReaders(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải bạn đọc.');
        } finally {
            setIsReadersLoading(false);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getReaderViolations(params);
                const { meta, items } = response.data.data;
                setEntityData(items);
                setMeta(meta);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, [filters]);

    useEffect(() => {
        fetchReaders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
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
            title: 'Lý do phạt',
            dataIndex: 'violationDetails',
            key: 'violationDetails',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Hình thức phạt',
            dataIndex: 'penaltyForm',
            key: 'penaltyForm',
            sorter: true,
            showSorterTooltip: false,
            render: getTagByPenaltyForm,
        },
        {
            title: 'Số tiền',
            dataIndex: 'fineAmount',
            key: 'fineAmount',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Ngày phạt',
            dataIndex: 'penaltyDate',
            key: 'penaltyDate',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<MdOutlineModeEdit />} onClick={() => showEditModal(record)} />
                    <Popconfirm
                        title="Thông báo"
                        description={
                            <div>
                                Bạn có chắc muốn xóa <b>{record.fullName}</b> không?
                            </div>
                        }
                        onConfirm={() => handleDeleteEntity(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<FaRegTrashAlt />} />
                    </Popconfirm>
                </Space>
            ),
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

            {/* Modal thêm mới */}
            <ViolationForm
                title="Thêm mới xử lý vi phạm"
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onSubmit={handleCreateEntity}
                isLoading={isLoading}
                form={addForm}
                initialValues={{
                    penaltyForm: cardPenaltyForm[0].value,
                    penaltyDate: dayjs(),
                    endDate: dayjs().add(1, 'month'),
                }}
                submitText="Thêm mới"
                fetchReaders={fetchReaders}
                isReadersLoading={isReadersLoading}
                readers={readers}
            />

            {/* Modal chỉnh sửa */}
            <ViolationForm
                title="Chỉnh sửa xử lý vi phạm"
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                onSubmit={handleUpdateEntity}
                isLoading={isLoading}
                form={editForm}
                fetchReaders={fetchReaders}
                isReadersLoading={isReadersLoading}
                readers={readers}
            />

            <Flex className="py-2" wrap justify="space-between" align="center">
                <h2>Xử lý vi phạm</h2>

                <Space>
                    <Space.Compact className="my-2">
                        <Select
                            options={options}
                            disabled={isLoading}
                            value={activeFilterOption}
                            onChange={(value) => setActiveFilterOption(value)}
                        />
                        <Input
                            allowClear
                            name="searchInput"
                            placeholder="Nhập từ cần tìm..."
                            value={searchInput}
                            disabled={isLoading}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <Button type="primary" loading={isLoading} onClick={() => handleSearch()}>
                            Tìm
                        </Button>
                    </Space.Compact>

                    <Button type="primary" onClick={showAddModal} loading={isLoading}>
                        Thêm mới
                    </Button>
                </Space>
            </Flex>

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
        </div>
    );
}

export default ReaderViolations;
