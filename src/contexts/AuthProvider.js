import PropTypes from 'prop-types';

import { createContext, useEffect, useState } from 'react';

import { ACCESS_TOKEN, REFRESH_TOKEN } from '~/common/commonConstants';
import Loading from '~/components/Loading';
import { logoutToken } from '~/services/authService';
import { getCurrentUserLogin } from '~/services/userService';

const AuthContext = createContext();

const defaultAuth = {
    isAuthenticated: false,
    user: {
        name: '',
        roleNames: [],
    },
};

const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(defaultAuth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        validateToken();
    }, []);

    const validateToken = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setAuthData(defaultAuth);
                setLoading(false);
                return;
            }
            const response = await getCurrentUserLogin();
            if (response.status === 200) {
                const { name, roleNames } = response.data.data;
                setAuthData({
                    isAuthenticated: true,
                    user: {
                        name,
                        roleNames,
                    },
                });
            } else {
                setAuthData(defaultAuth);
            }
        } catch (error) {
            setAuthData(defaultAuth);
        } finally {
            setLoading(false);
        }
    };

    const login = ({ accessToken, refreshToken }) => {
        if (accessToken) {
            localStorage.setItem(ACCESS_TOKEN, accessToken);
        }
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN, refreshToken);
        }
        validateToken();
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            const response = await logoutToken(refreshToken);
            if (response.status === 200) {
                setAuthData(defaultAuth);

                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
            }
        } catch (e) {}
    };

    const contextValues = {
        isAuthenticated: authData.isAuthenticated,
        user: authData.user,
        login,
        logout,
    };

    if (loading) {
        return <Loading />;
    }

    return <AuthContext.Provider value={contextValues}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};

export { AuthContext, AuthProvider };
