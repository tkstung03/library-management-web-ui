import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { getLibraryInfo } from '~/services/systemSettingService';

const LibraryContext = createContext();

const defaultLibraryInfo = {
    librarySymbol: '',
    libraryName: '',
    address: '',
    postalCode: '',
    countryCode: '',
    provinceCity: '',
    educationOffice: '',
    school: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    faxNumber: '',
    email: '',
    pageTitle: '',
    motto: '',
    logo: '',
    introduction: '',
};

const LibraryProvider = ({ children }) => {
    const [libraryInfo, setLibraryInfo] = useState(defaultLibraryInfo);

    useEffect(() => {
        const fetchLibraryInfo = async () => {
            try {
                const response = await getLibraryInfo();
                if (response.status === 200) {
                    const { data } = response.data;
                    if (data) {
                        setLibraryInfo(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch library info:', error);
            }
        };

        fetchLibraryInfo();
    }, []);

    return <LibraryContext.Provider value={libraryInfo}>{children}</LibraryContext.Provider>;
};

LibraryProvider.propTypes = {
    children: PropTypes.node,
};

export { LibraryContext, LibraryProvider };
