import { useContext } from 'react';
import { LibraryContext } from '~/contexts/LibraryProvider';

const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within an LibraryProvider');
    }
    return context;
};

export default useLibrary;
