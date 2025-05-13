import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Table } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import queryString from 'query-string';
import { INITIAL_FILTERS, INITIAL_META } from '~/common/commonConstants';
import {
    createCategory,
    deleteCategory,
    getCategories,
    toggleActiveFlag,
    updateCategory,
} from '~/services/categoryService';
import { getCategoryGroups } from '~/services/categoryGroupService';

const { Option } = Select;

function BookCategory({ active }) {
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
    const [parentCategories, setParentCategories] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    const showAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        addForm.resetFields();
    };

    const showEditModal = (record) => {
        setEditingItem(record);
        const item = {
            categoryName: record.categoryName,
            categoryCode: record.categoryCode,
            parentId: record.categoryGroup?.id,
        };
        editForm.setFieldsValue(item);
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
            const response = await createCategory(values);
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
            const response = await updateCategory(editingItem.id, values);
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
            const response = await deleteCategory(id);
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

    const fetchParentCategories = async (keyword = '') => {
        setIsFetching(true);
        try {
            const params = queryString.stringify({ keyword, searchBy: 'groupName', activeFlag: true });
            const response = await getCategoryGroups(params);
            const { items } = response.data.data;
            setParentCategories(items);
        } catch (error) {
            messageApi.error(error.message || 'Có lỗi xảy ra khi tải nhóm loại sách.');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const params = queryString.stringify(filters);
                const response = await getCategories(params);
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
        fetchParentCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'categoryName',
            key: 'categoryName',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Kí hiệu',
            dataIndex: 'categoryCode',
            key: 'categoryCode',
            sorter: true,
            showSorterTooltip: false,
        },
        {
            title: 'Thuộc nhóm',
            dataIndex: 'categoryGroup',
            key: 'categoryGroup',
            sorter: true,
            showSorterTooltip: false,
            render: (text) => <span>{text.name}</span>,
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
                                Bạn có chắc muốn xóa <b>{record.categoryName}</b> không?
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
            <Modal title="Thêm mới loại sách" open={isAddModalOpen} onOk={addForm.submit} onCancel={closeAddModal}>
                <Form form={addForm} layout="vertical" onFinish={handleCreateEntity}>
                    <Form.Item
                        label="Tên loại sách"
                        name="categoryName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên loại sách' }]}
                    >
                        <Input placeholder="Nhập tên loại sách" />
                    </Form.Item>
                    <Form.Item
                        label="Kí hiệu sách"
                        name="categoryCode"
                        rules={[{ required: true, message: 'Vui lòng nhập kí hiệu sách' }]}
                    >
                        <Input placeholder="Nhập tên kí hiệu sách" />
                    </Form.Item>
                    <Form.Item
                        label="Nhóm loại sách"
                        name="parentId"
                        rules={[{ required: true, message: 'Vui lòng chọn nhóm loại sách' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Nhóm loại sách"
                            allowClear
                            onSearch={fetchParentCategories}
                            loading={isFetching}
                            filterOption={false}
                        >
                            {parentCategories.map((parent) => (
                                <Option key={parent.id} value={parent.id}>
                                    {parent.groupName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal title="Sửa loại sách" open={isEditModalOpen} onOk={editForm.submit} onCancel={closeEditModal}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdateEntity}>
                    <Form.Item
                        label="Tên loại sách"
                        name="categoryName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên loại sách' }]}
                    >
                        <Input placeholder="Nhập tên loại sách" />
                    </Form.Item>
                    <Form.Item
                        label="Kí hiệu sách"
                        name="categoryCode"
                        rules={[{ required: true, message: 'Vui lòng nhập kí hiệu sách' }]}
                    >
                        <Input placeholder="Nhập tên kí hiệu sách" />
                    </Form.Item>
                    <Form.Item
                        label="Nhóm loại sách"
                        name="parentId"
                        rules={[{ required: true, message: 'Vui lòng chọn nhóm loại sách' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Nhóm loại sách"
                            allowClear
                            onSearch={fetchParentCategories}
                            loading={isFetching}
                            filterOption={false}
                        >
                            {parentCategories.map((parent) => (
                                <Option key={parent.id} value={parent.id}>
                                    {parent.groupName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Alert showIcon message={<div>Mỗi loại sách tương ứng với một sổ đăng ký cá biệt.</div>} type="info" />

            <Flex className="py-2" wrap justify="flex-end" align="center">
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

export default BookCategory;
