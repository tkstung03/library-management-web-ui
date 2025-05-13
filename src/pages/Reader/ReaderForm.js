import { useState } from 'react';
import { Image, Input, Modal, Row, Select } from 'antd';
import { Button, Col, DatePicker, Form, Upload } from 'antd';
import { MdOutlineFileUpload } from 'react-icons/md';
import images from '~/assets';
import { REGEXP_FULL_NAME, REGEXP_PASSWORD, REGEXP_PHONE_NUMBER } from '~/common/commonConstants';
import { cardGender, cardStatus, cardTypes } from '~/common/cardConstants';

function ReaderForm({
    title,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    form,
    initialValues = {},
    submitText = 'Lưu thay đổi',
    messageApi,
    isEdit = false,
}) {
    const [fileList, setFileList] = useState([]);

    const handleUploadChange = ({ file, fileList }) => {
        setFileList(fileList);

        const { originFileObj } = file;
        if (!originFileObj) {
            return;
        }

        const url = URL.createObjectURL(originFileObj);
        form.setFieldValue('previousImage', url);
        form.setFieldValue('image', originFileObj);
    };

    return (
        <Modal
            title={title}
            open={isOpen}
            onOk={form.submit}
            onCancel={onClose}
            width={800}
            centered
            footer={[
                <Button key="back" onClick={onClose}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={isLoading} onClick={form.submit}>
                    {isLoading ? 'Đang xử lý...' : submitText}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={initialValues}>
                <Row gutter={16}>
                    <Col span={8} className="text-center">
                        <Image width={200} src={form.getFieldValue('previousImage')} fallback={images.placeimg} />

                        <Form.Item className="mt-2" name="image" help="Vui lòng chọn hình ảnh dung lượng không quá 2MB">
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
                                <Button icon={<MdOutlineFileUpload />}>Chọn ảnh thẻ</Button>
                            </Upload>
                        </Form.Item>
                    </Col>

                    <Col span={16}>
                        <Row gutter={16}>
                            {/* Loại thẻ */}
                            <Col span={24}>
                                <Form.Item
                                    label="Loại thẻ"
                                    name="cardType"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại thẻ' }]}
                                >
                                    <Select placeholder="Chọn loại thẻ">
                                        {cardTypes.map((card) => (
                                            <Select.Option key={card.value} value={card.value}>
                                                {card.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            {/* Họ tên */}
                            <Col span={12}>
                                <Form.Item
                                    label="Họ tên"
                                    name="fullName"
                                    hasFeedback
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ tên' },
                                        {
                                            pattern: REGEXP_FULL_NAME,
                                            message: 'Họ tên không hợp lệ',
                                        },
                                        { min: 2, max: 100, message: 'Độ dài từ 2 - 100 kí tự' },
                                    ]}
                                >
                                    <Input placeholder="Nhập họ tên" />
                                </Form.Item>
                            </Col>

                            {/* Ngày sinh */}
                            <Col span={12}>
                                <Form.Item label="Ngày sinh" name="dateOfBirth">
                                    <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày sinh" className="w-100" />
                                </Form.Item>
                            </Col>

                            {/* Giới tính */}
                            <Col span={12}>
                                <Form.Item
                                    label="Giới tính"
                                    name="gender"
                                    rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                                >
                                    <Select placeholder="Chọn giới tính">
                                        {cardGender.map((card) => (
                                            <Select.Option key={card.value} value={card.value}>
                                                {card.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            {/* Địa chỉ */}
                            <Col span={12}>
                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ max: 255, message: 'Địa chỉ quá dài' }]}
                                >
                                    <Input placeholder="Nhập địa chỉ" autoComplete="off" />
                                </Form.Item>
                            </Col>

                            {/* Email */}
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {
                                            type: 'email',
                                            message: 'Địa chỉ email không hợp lệ',
                                        },
                                        {
                                            min: 5,
                                            message: 'Email phải có ít nhất 5 ký tự',
                                        },
                                        {
                                            max: 255,
                                            message: 'Email không được vượt quá 255 ký tự',
                                        },
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập email',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập email" autoComplete="off" />
                                </Form.Item>
                            </Col>

                            {/* Số điện thoại */}
                            <Col span={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    hasFeedback
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        {
                                            pattern: REGEXP_PHONE_NUMBER,
                                            message: 'Số điện thoại không hợp lệ',
                                        },
                                        { min: 10, max: 20, message: 'Số điện thoại phải từ 10 đến 20 ký tự' },
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>

                            {/* Số thẻ */}
                            <Col span={12}>
                                <Form.Item
                                    label="Số thẻ"
                                    name="cardNumber"
                                    hasFeedback
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số thẻ' },
                                        { max: 100, message: 'Số thẻ quá dài' },
                                        {
                                            pattern: /^[\x20-\x7E]*$/,
                                            message: 'Số thẻ chứa ký tự không hợp lệ',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập số thẻ" />
                                </Form.Item>
                            </Col>

                            {/* Mật khẩu */}
                            <Col span={12}>
                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    hasFeedback
                                    rules={
                                        isEdit
                                            ? [
                                                  {
                                                      pattern: REGEXP_PASSWORD,
                                                      message: 'Mật khẩu không đúng định dạng',
                                                  },
                                                  { min: 6, max: 30, message: 'Mật khẩu từ 6 - 30 kí tự' },
                                              ]
                                            : [
                                                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                                                  {
                                                      pattern: REGEXP_PASSWORD,
                                                      message: 'Mật khẩu không đúng định dạng',
                                                  },
                                                  { min: 6, max: 30, message: 'Mật khẩu từ 6 - 30 kí tự' },
                                              ]
                                    }
                                >
                                    <Input.Password placeholder="Nhập mật khẩu" />
                                </Form.Item>
                            </Col>

                            {/* Ngày hết hạn */}
                            <Col span={12}>
                                <Form.Item
                                    label="Ngày hết hạn"
                                    name="expiryDate"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
                                >
                                    <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày hết hạn" className="w-100" />
                                </Form.Item>
                            </Col>

                            {/* Trạng thái */}
                            <Col span={12}>
                                <Form.Item
                                    label="Trạng thái"
                                    name="status"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái thẻ' }]}
                                >
                                    <Select placeholder="Chọn trạng thái thẻ">
                                        {cardStatus.map((card) => (
                                            <Select.Option key={card.value} value={card.value}>
                                                {card.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

export default ReaderForm;
