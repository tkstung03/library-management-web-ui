import { useEffect, useState } from 'react';
import {
    Button,
    Checkbox,
    DatePicker,
    Flex,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Table,
} from 'antd';
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import { addHoliday, deleteHoliday, getAllHolidays, updateHoliday } from '~/services/systemSettingService';
import dayjs from 'dayjs';

function Holidays() {
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
        const values = {
            ...record,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
        };

        setEditingItem(values);
        editForm.setFieldsValue(values);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
    };

    const handleCreateEntity = async (values) => {
        try {
            const response = await addHoliday(values);
            if (response.status === 201) {
                const { data, message } = response.data.data;
                messageApi.success(message);

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
            const response = await updateHoliday(editingItem.id, values);
            if (response.status === 200) {
                const { data, message } = response.data.data;
                messageApi.success(message);

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
            const response = await deleteHoliday(id);
            if (response.status === 200) {
                messageApi.success(response.data.data.message);

                setEntityData((prev) => prev.filter((a) => a.id !== id));
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa.';
            messageApi.error(errorMessage);
        }
    };

    const handleToggleActiveFlag = async (checked, record) => {
        try {
            const values = {
                name: record.name,
                startDate: record.startDate,
                endDate: record.endDate,
                activeFlag: checked,
            };

            const response = await updateHoliday(record.id, values);
            if (response.status === 200) {
                const { data, message } = response.data.data;
                messageApi.success(message);

                setEntityData((prevData) => prevData.map((item) => (item.id === record.id ? data : item)));
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
                const response = await getAllHolidays();
                setEntityData(response.data.data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, []);

    const columns = [
        {
            title: 'Mã kỳ nghỉ',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên kỳ nghỉ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
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
        <>
            {contextHolder}

            {/* Modal thêm mới */}
            <Modal
                title="Thêm mới kì nghỉ ngày lễ"
                open={isAddModalOpen}
                onOk={addForm.submit}
                onCancel={closeAddModal}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleCreateEntity}
                    initialValues={{ startDate: dayjs(), endDate: dayjs().add(1, 'day'), activeFlag: true }}
                >
                    <Form.Item
                        label="Tên kì nghỉ ngày lễ"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên kì nghỉ ngày lễ' }]}
                    >
                        <Input placeholder="Nhập tên kì nghỉ ngày lễ" autoComplete="off" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày kết thúc"
                        name="endDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="activeFlag" valuePropName="checked">
                        <Checkbox>Kích hoạt</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal title="Sửa kì nghỉ ngày lễ" open={isEditModalOpen} onOk={editForm.submit} onCancel={closeEditModal}>
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateEntity}
                    initialValues={{ activeFlag: true }}
                >
                    <Form.Item
                        label="Tên kì nghỉ ngày lễ"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên kì nghỉ ngày lễ' }]}
                    >
                        <Input placeholder="Nhập tên kì nghỉ ngày lễ" autoComplete="off" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày kết thúc"
                        name="endDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="activeFlag" valuePropName="checked">
                        <Checkbox>Kích hoạt</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>

            <Flex className="py-2" wrap justify="space-between" align="center">
                <h2>Lịch nghỉ lễ</h2>
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
                pagination={false}
            />
        </>
    );
}

export default Holidays;
