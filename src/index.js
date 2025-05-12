import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ConfigProvider } from 'antd';
import viVN from 'antd/es/locale/vi_VN';

import { AuthProvider } from '~/contexts/AuthProvider';
import { LibraryProvider } from './contexts/LibraryProvider';

import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '~/styles/Global.scss';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: '#77b748',
                },
            }}
        >
            <LibraryProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </LibraryProvider>
        </ConfigProvider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
