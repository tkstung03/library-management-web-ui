import { Spin } from 'antd';

function Loading() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#fdfdfd',
            }}
        >
            <Spin size="large" />
        </div>
    );
}

export default Loading;
