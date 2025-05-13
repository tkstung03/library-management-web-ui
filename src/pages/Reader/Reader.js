import { useEffect, useState } from 'react';
import { Input, message, Popconfirm, Select, Space } from 'antd';
import { Button, Dropdown, Flex, Form, Table, Tag } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt, FaPrint } from 'react-icons/fa';
import queryString from 'query-string';
import dayjs from 'dayjs';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import { createReader, deleteReader, getReaders, printCards, updateReader } from '~/services/readerService';
import ReaderForm from './ReaderForm';
import { cardGender, cardStatus, cardTypes } from '~/common/cardConstants';

const options = [
    { value: 'cardNumber', label: 'Số thẻ' },
    { value: 'fullName', label: 'Họ tên' },
    { value: 'status', label: 'Trạng thái' },
];

const cardTypeMapping = {
    TEACHER: { label: 'Giảng viên', color: 'blue' },
    STUDENT: { label: 'Sinh viên', color: 'green' },
};

const cardStatusMapping = {
    ACTIVE: { label: 'Đã kích hoạt', color: 'green' },
    INACTIVE: { label: 'Chưa kích hoạt', color: 'default' },
    SUSPENDED: { label: 'Tạm dừng', color: 'warning' },
    REVOKED: { label: 'Thu hồi thẻ', color: 'red' },
};

const getTagByCardType = (text) => {
    const { label, color } = cardTypeMapping[text] || { label: 'Khác', color: 'default' };
    return <Tag color={color}>{label}</Tag>;
};

const getTagByCardStatus = (text) => {
    const { label, color } = cardStatusMapping[text] || { label: 'Khác', color: 'default' };
    return <Tag color={color}>{label}</Tag>;
};

function Reader() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

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

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
            dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
            expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
            previousImage: record.avatar || null,
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
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
            };

            const response = await createReader(formattedValues);
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
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
            };

            const response = await updateReader(editingItem.id, formattedValues);
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
            const response = await deleteReader(id);
            if (response.status === 200) {
                setEntityData((prev) => prev.filter((a) => a.id !== id));

                messageApi.success(response.data.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa.';
            messageApi.error(errorMessage);
        }
    };

    const handleCreateCard = async () => {
        if (selectedRowKeys.length === 0) {
            messageApi.info('Vui lòng chọn ít nhất một thẻ.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await printCards({
                principalName: 'Kiều Xuân Thực',
                managementUnit: 'Bộ Công Thương',
                schoolName: 'Trường Đại học Công nghiệp Hà Nội',
                readerIds: selectedRowKeys,
            });

            if (response.status === 200) {
                // Chuyển đổi mảng byte thành Blob
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                // Mở hoặc tải xuống file PDF
                const newTab = window.open(url, '_blank');
                newTab.focus(); // Đưa tab mới lên trước

                // Giải phóng URL sau khi sử dụng
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất dữ liệu.';
            messageApi.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getReaders(params);
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

    const rowSelection = {
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
        },
        getCheckboxProps: (record, index) => ({
            name: record.id,
        }),
    };

    const columns = [
        {
            title: 'Số thẻ',
            dataIndex: 'cardNumber',
            key: 'cardNumber',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Loại thẻ',
            dataIndex: 'cardType',
            key: 'cardType',
            sorter: true,
            showSorterTooltip: false,
            render: getTagByCardType,
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => (text ? new Date(text).toLocaleDateString() : 'N/A'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => text || 'N/A',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            showSorterTooltip: false,
            render: getTagByCardStatus,
        },
        {
            title: 'Thống kê',
            children: [
                {
                    title: 'Phiếu mượn',
                    dataIndex: 'currentBorrowedBooks',
                    key: 'currentBorrowedBooks',
                },
                {
                    title: 'Vào thư viện',
                    dataIndex: 'libraryVisitCount',
                    key: 'libraryVisitCount',
                },
            ],
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

    const items = [
        {
            key: '0',
            label: 'In thẻ bạn đọc',
            onClick: handleCreateCard,
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

            {/* Modal thêm mới thẻ */}
            <ReaderForm
                title="Thêm mới thẻ bạn đọc"
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onSubmit={handleCreateEntity}
                isLoading={isLoading}
                form={addForm}
                initialValues={{
                    cardType: cardTypes[0].value,
                    status: cardStatus[0].value,
                    gender: cardGender[0].value,
                    dateOfBirth: dayjs(),
                    expiryDate: dayjs().add(1, 'month'),
                }}
                submitText="Thêm mới"
                messageApi={messageApi}
            />

            {/* Modal chỉnh sửa */}
            <ReaderForm
                title="Chỉnh sửa thẻ bạn đọc"
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                onSubmit={handleUpdateEntity}
                isLoading={isLoading}
                form={editForm}
                messageApi={messageApi}
                isEdit
            />

            <Flex className="py-2" wrap justify="space-between" align="center">
                <h2>Thẻ bạn đọc</h2>

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
                    <Dropdown menu={{ items }}>
                        <Button icon={<FaPrint />}>In</Button>
                    </Dropdown>
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
                rowSelection={rowSelection}
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

export default Reader;
