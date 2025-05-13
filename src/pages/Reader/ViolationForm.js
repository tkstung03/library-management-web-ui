import { Button, Col, DatePicker, Form } from 'antd';
import { Input, InputNumber, Modal, Row, Select } from 'antd';
import { cardPenaltyForm } from '~/common/cardConstants';

function ViolationForm({
    title,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    form,
    initialValues = {},
    submitText = 'Lưu thay đổi',
    fetchReaders,
    isReadersLoading,
    readers,
}) {
    return (
        <Modal
            title={title}
            open={isOpen}
            onOk={form.submit}
            onCancel={onClose}
            width={600}
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
                    {/* Bạn đọc */}
                    <Col span={12}>
                        <Form.Item
                            label="Bạn đọc"
                            name="readerId"
                            hasFeedback
                            rules={[{ required: true, message: 'Vui lòng chọn bạn đọc' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn bạn đọc"
                                filterOption={false}
                                onSearch={fetchReaders}
                                loading={isReadersLoading}
                                options={readers.map((reader) => ({
                                    value: reader.id,
                                    label: `${reader.cardNumber} - ${reader.fullName}`,
                                }))}
                                className="w-100"
                            />
                        </Form.Item>
                    </Col>

                    {/* Nội dung vi phạm */}
                    <Col span={12}>
                        <Form.Item
                            label="Nội dung vi phạm"
                            name="violationDetails"
                            hasFeedback
                            rules={[
                                { required: true, message: 'Vui lòng nhập nội dung vi phạm' },
                                { max: 100, message: 'Nội dung vi phạm quá dài' },
                            ]}
                        >
                            <Input.TextArea rows={1} placeholder="Nhập nội dung vi phạm" maxLength={100} showCount />
                        </Form.Item>
                    </Col>

                    {/* Hình thức phạt */}
                    <Col span={12}>
                        <Form.Item
                            label="Hình thức phạt"
                            name="penaltyForm"
                            hasFeedback
                            rules={[{ required: true, message: 'Vui lòng chọn hình thức phạt' }]}
                        >
                            <Select placeholder="Chọn hình thức phạt">
                                {cardPenaltyForm.map((card) => (
                                    <Select.Option key={card.value} value={card.value}>
                                        {card.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Hình thức khác */}
                    <Col span={12}>
                        <Form.Item
                            label="Hình thức khác"
                            name="otherPenaltyForm"
                            hasFeedback
                            rules={[{ max: 100, message: 'Độ dài tối đa 100 ký tự' }]}
                        >
                            <Input placeholder="Nhập hình thức khác" />
                        </Form.Item>
                    </Col>

                    {/* Ngày phạt */}
                    <Col span={12}>
                        <Form.Item
                            label="Ngày phạt"
                            name="penaltyDate"
                            hasFeedback
                            rules={[{ required: true, message: 'Vui lòng chọn ngày phạt' }]}
                        >
                            <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày phạt" className="w-100" />
                        </Form.Item>
                    </Col>

                    {/* Ngày hết hạn */}
                    <Col span={12}>
                        <Form.Item label="Ngày hết hạn" name="endDate">
                            <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày hết hạn" className="w-100" />
                        </Form.Item>
                    </Col>

                    {/* Số tiền phạt */}
                    <Col span={12}>
                        <Form.Item label="Số tiền phạt" name="fineAmount">
                            <InputNumber min={0} placeholder="Nhập số tiền phạt" className="w-100" addonAfter="đ" />
                        </Form.Item>
                    </Col>

                    {/* Ghi chú */}
                    <Col span={12}>
                        <Form.Item
                            label="Ghi chú"
                            name="notes"
                            rules={[{ max: 255, message: 'Độ dài tối đa 255 ký tự' }]}
                        >
                            <Input.TextArea rows={1} placeholder="Nhập ghi chú" maxLength={255} showCount />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

export default ViolationForm;
