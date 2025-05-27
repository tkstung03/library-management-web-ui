import { useEffect, useState } from 'react';
import { getLibraryConfig } from '~/services/systemSettingService';

const useSystemConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            try {
                const res = await getLibraryConfig();
                setConfig(res.data?.data || {});
            } catch (err) {
                console.error('Lỗi khi tải cấu hình hệ thống:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return { config, loading, error };
};

export default useSystemConfig;
