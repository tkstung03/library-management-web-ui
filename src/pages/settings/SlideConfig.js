import React, { useEffect, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { MdOutlineModeEdit, MdOutlineFileUpload } from 'react-icons/md';
import { Image, Flex, message, Popconfirm, Checkbox, Row, Col } from 'antd';
import { Table, Button, Space, Modal, Input, Form, Switch, Upload } from 'antd';
import images from '~/assets';
import { addSlide, deleteSlide, getSlides, toggleActiveFlagSlide, updateSlide } from '~/services/systemSettingService';

const { TextArea } = Input;

function SlideConfig() {
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

    const [fileList, setFileList] = useState([]);
    const [previousImage, setPreviousImage] = useState(images.placeimgHorizontal);

    const handleUploadChange = ({ file, fileList }) => {
        setFileList(fileList);

        const { originFileObj } = file;
        if (!originFileObj) {
            return;
        }

        // Tạo URL cho hình ảnh và cập nhật giá trị trong form
        const url = URL.createObjectURL(originFileObj);
        setPreviousImage(url);
        if (isAddModalOpen) {
            addForm.setFieldValue('image', originFileObj);
        } else if (isEditModalOpen) {
            editForm.setFieldValue('image', originFileObj);
        }
    };

    const showAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        addForm.resetFields();

        setPreviousImage(images.placeimgHorizontal);
        setFileList([]);
    };

    const showEditModal = (record) => {
        setPreviousImage(record.imageUrl || images.placeimgHorizontal);

        setEditingItem(record);
        editForm.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();

        setPreviousImage(images.placeimgHorizontal);
        setFileList([]);
    };

    const handleCreateEntity = async (values) => {
        setIsLoading(true);
        try {
            const response = await addSlide(values);
            if (response.status === 201) {
                const { data, message } = response.data.data;
                messageApi.success(message);

                setEntityData((prevData) => [...prevData, data]);
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
            const response = await updateSlide(editingItem.id, values);
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
            const response = await deleteSlide(id);
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
            const response = await toggleActiveFlagSlide(record.id);
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
                const response = await getSlides();
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
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (text) => <Image width={100} src={text} alt="Slide" />,
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
                        description={<div>Bạn có chắc muốn xóa slide này không?</div>}
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
                title="Thêm mới slide"
                open={isAddModalOpen}
                onOk={addForm.submit}
                onCancel={closeAddModal}
                footer={[
                    <Button key="back" onClick={closeAddModal}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={isLoading} onClick={addForm.submit}>
                        {isLoading ? 'Đang xử lý...' : 'Thêm mới'}
                    </Button>,
                ]}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleCreateEntity}
                    initialValues={{ title: '', description: '', activeFlag: true }}
                >
                    <Row gutter={16}>
                        <Col span={12} className="text-center">
                            <Image width={200} src={previousImage} fallback={images.placeimgHorizontal} />

                            <Form.Item
                                className="mt-2"
                                name="image"
                                help="Vui lòng chọn hình ảnh dung lượng không quá 2MB"
                                rules={[{ required: true, message: 'Vui lòng chọn hình ảnh' }]}
                            >
                                <Upload
                                    accept="image/*"
                                    fileList={fileList}
                                    maxCount={1}
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            messageApi.error('Bạn chỉ có thể upload file hình ảnh!');
                                        }
                                        return isImage;
                                    }}
                                    onChange={handleUploadChange}
                                    customRequest={() => false}
                                >
                                    <Button icon={<MdOutlineFileUpload />}>Chọn hình ảnh</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Tiêu đề" name="title">
                                <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>

                            <Form.Item label="Mô tả" name="description">
                                <TextArea rows={3} placeholder="Nhập mô tả" />
                            </Form.Item>

                            <Form.Item label="Trạng thái" name="activeFlag" valuePropName="checked">
                                <Checkbox>Kích hoạt</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal
                title="Chỉnh sửa slide"
                open={isEditModalOpen}
                onOk={editForm.submit}
                onCancel={closeEditModal}
                footer={[
                    <Button key="back" onClick={closeEditModal}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={isLoading} onClick={editForm.submit}>
                        {isLoading ? 'Đang xử lý...' : 'Lưu'}
                    </Button>,
                ]}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdateEntity}>
                    <Row gutter={16}>
                        <Col span={12} className="text-center">
                            <Image width={200} src={previousImage} fallback={images.placeimgHorizontal} />

                            <Form.Item
                                className="mt-2"
                                name="image"
                                help="Vui lòng chọn hình ảnh dung lượng không quá 2MB"
                            >
                                <Upload
                                    accept="image/*"
                                    fileList={fileList}
                                    maxCount={1}
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            messageApi.error('Bạn chỉ có thể upload file hình ảnh!');
                                        }
                                        return isImage;
                                    }}
                                    onChange={handleUploadChange}
                                    customRequest={() => false}
                                >
                                    <Button icon={<MdOutlineFileUpload />}>Chọn hình ảnh</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Tiêu đề" name="title">
                                <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>

                            <Form.Item label="Mô tả" name="description">
                                <TextArea rows={3} placeholder="Nhập mô tả" />
                            </Form.Item>

                            <Form.Item label="Trạng thái" name="activeFlag" valuePropName="checked">
                                <Checkbox>Kích hoạt</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Flex className="py-2" wrap justify="space-between" align="center">
                <h2>Thiết lập slide</h2>
                <Button type="primary" onClick={showAddModal}>
                    Thêm slide
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

export default SlideConfig;
