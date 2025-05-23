import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, message, Modal, Popconfirm, Space, Switch, Table } from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import queryString from 'query-string';

import { getAllMajors, createMajor, updateMajor, deleteMajor, toggleMajorActiveStatus } from '~/services/majorService';

const INITIAL_FILTERS = {
    pageNumb: 1,
    pageSize: 10,
    sortBy: 'id',
    sortType: 'ASC',
    keyword: '',
};

const INITIAL_META = {
    totalElements: 0,
    totalPages: 0,
};

function MajorPage() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [meta, setMeta] = useState(INITIAL_META);
    const [majors, setMajors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    // Modal Thêm mới
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm] = Form.useForm();

    // Modal Sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMajor, setEditingMajor] = useState(null);
    const [editForm] = Form.useForm();

    const fetchMajors = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
        const params = queryString.stringify(filters);
        const response = await getAllMajors(params);

        // Kiểm tra đúng chỗ lấy data:
        if (response && response.data && response.data.items) {
            setMajors(response.data.items);
            setMeta(response.data.meta);
        } else {
            setMajors([]);
            setMeta(INITIAL_META);
        }
    } catch (error) {
        setErrorMessage(error.message || 'Lỗi khi tải danh sách chuyên ngành');
    } finally {
        setIsLoading(false);
    }
};


    useEffect(() => {
        fetchMajors();
    }, [filters]);

    const showAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => {
        addForm.resetFields();
        setIsAddModalOpen(false);
    };

    const showEditModal = (record) => {
        setEditingMajor(record);
        editForm.setFieldsValue({
            name: record.name,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        editForm.resetFields();
        setIsEditModalOpen(false);
    };

    // Thêm mới chuyên ngành
    const handleCreateMajor = async (values) => {
        try {
            const response = await createMajor(values);
            if (response.status === 201 || response.status === 200) {
                messageApi.success('Thêm mới thành công');
                closeAddModal();
                fetchMajors();
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Lỗi khi thêm mới chuyên ngành');
        }
    };

    // Cập nhật chuyên ngành
    const handleUpdateMajor = async (values) => {
        try {
            const response = await updateMajor(editingMajor.id, values);
            if (response.status === 200) {
                messageApi.success('Cập nhật thành công');
                closeEditModal();
                fetchMajors();
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Lỗi khi cập nhật chuyên ngành');
        }
    };

    // Xóa chuyên ngành
    const handleDeleteMajor = async (id) => {
        try {
            const response = await deleteMajor(id);
            if (response.status === 200) {
                messageApi.success('Xóa thành công');
                fetchMajors();
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Lỗi khi xóa chuyên ngành');
        }
    };

    // Bật / tắt trạng thái active
    const handleToggleActive = async (checked, record) => {
        try {
            const response = await toggleMajorActiveStatus(record.id);
            if (response.status === 200) {
                messageApi.success('Cập nhật trạng thái thành công');
                fetchMajors();
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const columns = [
    {
        title: 'Tên chuyên ngành',
        dataIndex: 'name',  // sửa lại thành 'name'
        key: 'name',
        sorter: true,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'activeFlag',
        key: 'activeFlag',
        render: (text, record) => (
            <Space>
                {text ? 'Đang sử dụng' : 'Tạm dừng'}
                <Switch checked={text} onChange={(checked) => handleToggleActive(checked, record)} />
            </Space>
        ),
    },
    {
        title: 'Hành động',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
            <Space>
                <Button type="text" icon={<MdOutlineModeEdit />} onClick={() => showEditModal(record)} />
                <Popconfirm
                    title="Xác nhận"
                    description={`Bạn có chắc muốn xóa chuyên ngành "${record.name}" không?`}
                    onConfirm={() => handleDeleteMajor(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button type="text" danger icon={<FaRegTrashAlt />} />
                </Popconfirm>
            </Space>
        ),
    },
];


    // Phân trang, sắp xếp
    const handleTableChange = (pagination, filters, sorter) => {
        setFilters((prev) => ({
            ...prev,
            pageNumb: pagination.current,
            pageSize: pagination.pageSize,
            sortBy: sorter.field || 'id',
            sortType: sorter.order === 'ascend' ? 'ASC' : sorter.order === 'descend' ? 'DESC' : 'ASC',
        }));
    };

    if (errorMessage) {
        return <Alert message={`Lỗi: ${errorMessage}`} type="error" showIcon />;
    }

    return (
        <div>
            {contextHolder}

            {/* Modal Thêm mới */}
            <Modal
                title="Thêm mới chuyên ngành"
                open={isAddModalOpen}
                onOk={addForm.submit}
                onCancel={closeAddModal}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={handleCreateMajor}>
                    <Form.Item
                        label="Tên chuyên ngành"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chuyên ngành' }]}
                    >
                        <Input placeholder="Nhập tên chuyên ngành" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Sửa */}
            <Modal
                title="Chỉnh sửa chuyên ngành"
                open={isEditModalOpen}
                onOk={editForm.submit}
                onCancel={closeEditModal}
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdateMajor}>
                    <Form.Item
                        label="Tên chuyên ngành"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chuyên ngành' }]}
                    >
                        <Input placeholder="Nhập tên chuyên ngành" />
                    </Form.Item>
                </Form>
            </Modal>

            <Alert showIcon message="Quản lý danh sách chuyên ngành đào tạo của trường" type="info" className="mb-3" />

            <Button type="primary" onClick={showAddModal} className="mb-3">
                Thêm mới
            </Button>

            <Table
                bordered
                rowKey="id"
                dataSource={majors}
                columns={columns}
                loading={isLoading}
                pagination={{
                    current: filters.pageNumb,
                    pageSize: filters.pageSize,
                    total: meta.totalElements,
                    showSizeChanger: true,
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
}

export default MajorPage;
