const { Tag } = require('antd');

export const bookBorrowReceiptMapping = {
    NOT_RETURNED: <Tag color="gold">Chưa trả</Tag>,
    LOST: <Tag color="red">Báo mất</Tag>,
    RETURNED: <Tag color="green">Đã trả</Tag>,
    OVERDUE: <Tag color="orange">Quá hạn</Tag>,
};
