import { useEffect, useState } from 'react';
import { Button, Flex, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Table } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import queryString from 'query-string';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import {
    createClassificationSymbol,
    deleteClassificationSymbol,
    getClassificationSymbols,
    toggleActiveFlag,
    updateClassificationSymbol,
} from '~/services/classificationSymbolService';

function ClassificationSymbol() {
    const [meta, setMeta] = useState(INITIAL_META);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [entityData, setEntityData] = useState(null);

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
        setEditingItem(record);
        editForm.setFieldsValue(record);
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

    const handleCreateEntity = async (values) => {
        try {
            const response = await createClassificationSymbol(values);
            if (response.status === 201) {
                const { data, message } = response.data.data;
                messageApi.success(message);

                // Cập nhật lại danh sách sau khi thêm mới
                setEntityData((prevData) => [...prevData, data]);
                closeAddModal();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thêm mới.';
            messageApi.error(errorMessage);
        }
    };

    const handleUpdateEntity = async (values) => {
        try {
            const response = await updateClassificationSymbol(editingItem.id, values);
            if (response.status === 200) {
                const { data, message } = response.data.data;
                messageApi.success(message);

                // Cập nhật lại danh sách sau khi sửa
                setEntityData((prevData) => prevData.map((item) => (item.id === editingItem.id ? data : item)));
                closeEditModal();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.';
            messageApi.error(errorMessage);
        }
    };

    const handleDeleteEntity = async (id) => {
        try {
            const response = await deleteClassificationSymbol(id);
            if (response.status === 200) {
                setEntityData((prev) => prev.filter((a) => a.id !== id));

                messageApi.success(response.data.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa.';
            messageApi.error(errorMessage);
        }
    };

    const handleToggleActiveFlag = async (checked, record) => {
        try {
            const response = await toggleActiveFlag(record.id);
            if (response.status === 200) {
                const { data, message } = response.data.data;
                setEntityData((prevData) =>
                    prevData.map((item) => (item.id === record.id ? { ...item, activeFlag: data } : item)),
                );
                messageApi.success(message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.';
            messageApi.error(errorMessage);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getClassificationSymbols(params);
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

    const columns = [
        {
            title: 'Cấp',
            dataIndex: 'level',
            key: 'level',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Tên phân loại',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Kí hiệu phân loại',
            dataIndex: 'code',
            key: 'code',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'activeFlag',
            key: 'activeFlag',
            render: (text, record) => (
                <Space>
                    {text ? 'Đang theo dõi' : 'Ngừng theo dõi'}
                    <Switch checked={text} onChange={(checked) => handleToggleActiveFlag(checked, record)} />
                </Space>
            ),
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
                                Bạn có chắc muốn xóa <b>{record.name}</b> không?
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
            <Modal
                title="Thêm mới kí hiệu phân loại"
                open={isAddModalOpen}
                onOk={addForm.submit}
                onCancel={closeAddModal}
            >
                <Form form={addForm} layout="vertical" onFinish={handleCreateEntity}>
                    <Form.Item
                        label="Tên kí hiệu phân loại"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên kí hiệu phân loại' }]}
                    >
                        <Input placeholder="Nhập tên kí hiệu phân loại" />
                    </Form.Item>
                    <Form.Item
                        label="Mã kí hiệu phân loại"
                        name="code"
                        rules={[{ required: true, message: 'Vui lòng nhập mã kí hiệu phân loại' }]}
                    >
                        <Input placeholder="Nhập mã kí hiệu phân loại" />
                    </Form.Item>
                    <Form.Item label="Cấp" name="level">
                        <Select placeholder="Chọn cấp" allowClear>
                            <Select.Option value={1}>Cấp 1</Select.Option>
                            <Select.Option value={2}>Cấp 2</Select.Option>
                            <Select.Option value={3}>Cấp 3</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal
                title="Sửa kí hiệu phân loại"
                open={isEditModalOpen}
                onOk={editForm.submit}
                onCancel={closeEditModal}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdateEntity}>
                    <Form.Item
                        label="Tên kí hiệu phân loại"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên kí hiệu phân loại' }]}
                    >
                        <Input placeholder="Nhập tên kí hiệu phân loại" />
                    </Form.Item>
                    <Form.Item
                        label="Mã kí hiệu phân loại"
                        name="code"
                        rules={[{ required: true, message: 'Vui lòng nhập mã kí hiệu phân loại' }]}
                    >
                        <Input placeholder="Nhập mã kí hiệu phân loại" />
                    </Form.Item>
                    <Form.Item label="Cấp" name="level">
                        <Select placeholder="Chọn cấp" allowClear>
                            <Select.Option value={1}>Cấp 1</Select.Option>
                            <Select.Option value={2}>Cấp 2</Select.Option>
                            <Select.Option value={3}>Cấp 3</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Flex className="py-2" wrap justify="space-between" align="center">
                <h2>Kí hiệu phân loại</h2>
                <Button type="primary" onClick={showAddModal}>
                    Thêm mới
                </Button>
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

export default ClassificationSymbol;
