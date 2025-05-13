import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function AccessDenied() {
    const navigate = useNavigate();

    return (
        <Result
            status="403"
            title="403"
            subTitle="Xin lỗi, bạn không được phép truy cập vào trang này."
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    Quay về trang chủ
                </Button>
            }
        />
    );
}

export default AccessDenied;
